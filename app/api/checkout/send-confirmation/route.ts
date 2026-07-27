import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendEmailsForPaymentIntent } from "@/lib/email/send-for-payment-intent";
import {
  checkRateLimitAsync,
  clientIp,
} from "@/lib/security/rate-limit";
import {
  assertContentLength,
  isRequestGuardError,
} from "@/lib/security/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 2_048;

/**
 * Success-page fallback when Stripe webhooks are missing payment_intent.succeeded
 * or fire too slowly. Idempotent (Resend idempotency keys).
 */
export async function POST(req: Request) {
  try {
    const rate = await checkRateLimitAsync(
      `send-confirm:${clientIp(req.headers)}`,
      { limit: 20, windowMs: 60_000 },
    );
    if (rate.limited) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Not configured." },
        { status: 500 },
      );
    }

    assertContentLength(req.headers, MAX_BODY);

    let body: {
      paymentIntentId?: string;
      clientSecret?: string;
      email?: string;
    };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const paymentIntentId =
      typeof body.paymentIntentId === "string"
        ? body.paymentIntentId.trim()
        : "";
    const clientSecret =
      typeof body.clientSecret === "string" ? body.clientSecret.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!paymentIntentId.startsWith("pi_") || !clientSecret.includes("_secret_")) {
      return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.client_secret !== clientSecret) {
      return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
    }

    if (pi.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment is not complete yet.", status: pi.status },
        { status: 409 },
      );
    }

    const result = await sendEmailsForPaymentIntent(
      stripe,
      paymentIntentId,
      email || undefined,
    );

    return NextResponse.json({
      ok: result.sent,
      skipped: result.skipped,
      error: result.error,
    });
  } catch (err) {
    if (isRequestGuardError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[send-confirmation]", err);
    return NextResponse.json(
      { error: "Unable to send confirmation." },
      { status: 500 },
    );
  }
}
