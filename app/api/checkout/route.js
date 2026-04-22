import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const items = Array.isArray(body?.items) ? body.items : [];
    const normalizedItems = items
      .map((item) => ({
        name: typeof item?.name === "string" && item.name.trim() ? item.name.trim() : "FORGE Product",
        price: Math.round(Number(item?.price || 0) * 100),
        quantity: Math.max(1, Number(item?.quantity) || 1),
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
    return NextResponse.json(
      { error: err?.message || "Stripe failed" },
      { status: 500 },
    );
  }
}
