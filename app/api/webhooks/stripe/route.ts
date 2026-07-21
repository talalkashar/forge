import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  decrementInventoryForOrder,
  parseInventoryMetadata,
} from "@/lib/inventory/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecret);
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

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
  }

  return NextResponse.json({ received: true });
}
