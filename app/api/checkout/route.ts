import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const body: { items?: CheckoutItem[] } = await req.json();
    const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];
    const normalizedItems = items
      .map((item) => ({
        name: item.name.trim() ? item.name.trim() : "FORGE Product",
        price: Math.round(item.price * 100),
        quantity: Math.max(1, item.quantity),
      }))
      .filter((item) => Number.isFinite(item.price) && item.price > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: normalizedItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR FULL:", err);
    const message = err instanceof Error ? err.message : "Stripe failed";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
