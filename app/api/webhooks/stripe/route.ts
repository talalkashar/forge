import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderConfirmationEmails } from "@/lib/email/order-confirmation";
import { sendEmailsForPaymentIntent } from "@/lib/email/send-for-payment-intent";
import {
  decrementInventoryForOrder,
  parseInventoryMetadata,
} from "@/lib/inventory/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WEBHOOK_BODY_BYTES = 256_000;

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const stripe = new Stripe(stripeSecret);
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await req.text();
  if (body.length > MAX_WEBHOOK_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // On-site Payment Element flow.
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const lines = parseInventoryMetadata(
      paymentIntent.metadata?.inventory_items,
    );

    if (lines.length > 0) {
      const result = await decrementInventoryForOrder({
        externalOrderId: paymentIntent.id,
        lines,
        channel: "stripe",
        reason: "stripe_payment_intent_succeeded",
      });

      if (!result.ok) {
        console.error("[stripe webhook] inventory decrement failed:", result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }

    // Email failures must not fail the webhook (inventory already applied).
    try {
      const emailResult = await sendEmailsForPaymentIntent(
        stripe,
        paymentIntent.id,
      );
      if (!emailResult.sent) {
        console.warn(
          "[stripe webhook] order email not sent:",
          emailResult.skipped || emailResult.error,
        );
      }
    } catch (error) {
      console.error("[stripe webhook] order email error:", error);
    }
  }

  // Legacy hosted Checkout sessions (if any still complete).
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const lines = parseInventoryMetadata(session.metadata?.inventory_items);

    if (lines.length > 0) {
      const result = await decrementInventoryForOrder({
        externalOrderId: session.id,
        lines,
        channel: "stripe",
        reason: "stripe_checkout_completed",
      });

      if (!result.ok) {
        console.error("[stripe webhook] inventory decrement failed:", result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }

    const customerEmail =
      session.customer_details?.email?.trim() ||
      session.customer_email?.trim() ||
      "";

    await sendOrderConfirmationEmails({
      orderId: session.id,
      customerEmail,
      lineSummary: "FORGE GYM order",
      amountCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
    });
  }

  return NextResponse.json({ received: true });
}
