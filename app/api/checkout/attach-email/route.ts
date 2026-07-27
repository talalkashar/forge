import { NextResponse } from "next/server";
import Stripe from "stripe";
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

function paymentIntentIdFromClientSecret(clientSecret: string) {
  // Format: pi_xxx_secret_yyy
  const idx = clientSecret.indexOf("_secret_");
  if (idx <= 0) return "";
  return clientSecret.slice(0, idx);
}

export async function POST(req: Request) {
  try {
    const rate = await checkRateLimitAsync(
      `checkout-email:${clientIp(req.headers)}`,
      { limit: 30, windowMs: 60_000 },
    );
    if (rate.limited) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Checkout is not configured." },
        { status: 500 },
      );
    }

    assertContentLength(req.headers, MAX_BODY);

    let body: { clientSecret?: string; email?: string };
    try {
      body = (await req.json()) as { clientSecret?: string; email?: string };
    } catch {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const clientSecret =
      typeof body.clientSecret === "string" ? body.clientSecret.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!clientSecret.includes("_secret_") || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email and payment session required." },
        { status: 400 },
      );
    }

    const paymentIntentId = paymentIntentIdFromClientSecret(clientSecret);
    if (!paymentIntentId.startsWith("pi_")) {
      return NextResponse.json({ error: "Invalid payment session." }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.client_secret !== clientSecret) {
      return NextResponse.json({ error: "Invalid payment session." }, { status: 400 });
    }

    if (pi.status === "succeeded" || pi.status === "canceled") {
      return NextResponse.json({ ok: true, status: pi.status });
    }

    await stripe.paymentIntents.update(paymentIntentId, {
      receipt_email: email,
      metadata: {
        ...pi.metadata,
        customer_email: email,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isRequestGuardError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[attach-email]", err);
    return NextResponse.json(
      { error: "Unable to save email for this order." },
      { status: 500 },
    );
  }
}
