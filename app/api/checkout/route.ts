import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getProductBySlug } from "@/lib/products/marketplace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutItem = {
  slug?: string;
  variantId?: string;
  name?: string;
  price?: number;
  quantity: number;
};

const beltSlugs = new Set(["zeus", "berserk", "black"]);

async function normalizeCheckoutItem(item: CheckoutItem) {
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const slug = typeof item.slug === "string" ? item.slug : "";
  const variantId = typeof item.variantId === "string" ? item.variantId : "";

  if (!slug) {
    throw new Error("Please re-add this item before checkout.");
  }

  if (beltSlugs.has(slug) && !variantId) {
    throw new Error("Please re-add your belt size before checkout.");
  }

  const productResult = await getProductBySlug(slug);

  if (productResult.error) {
    throw new Error("Could not verify live inventory. Please try again.");
  }

  if (!productResult.missingEnv && productResult.data) {
    if (variantId) {
      const variant = (productResult.data.product_variants ?? []).find(
        (productVariant) => productVariant.id === variantId,
      );

      if (!variant || variant.is_active !== true) {
        throw new Error(`${productResult.data.name} is out of stock.`);
      }

      const inventoryQuantity = variant.inventory_quantity ?? 0;

      if (inventoryQuantity <= 0) {
        throw new Error(`${productResult.data.name} ${variant.size ?? ""} is out of stock.`);
      }

      if (quantity > inventoryQuantity) {
        throw new Error(
          `Only ${inventoryQuantity} ${productResult.data.name} ${variant.size ?? ""} left in stock.`,
        );
      }

      return {
        name: `${productResult.data.name}${variant.size ? ` - ${variant.size}` : ""}`,
        price: variant.price_cents ?? productResult.data.base_price_cents,
        quantity,
      };
    }

    const activeVariants = (productResult.data.product_variants ?? []).filter(
      (variant) => variant.is_active === true,
    );
    const inventoryQuantity = activeVariants.reduce(
      (total, variant) => total + (variant.inventory_quantity ?? 0),
      0,
    );

    if (activeVariants.length === 0 || inventoryQuantity <= 0) {
      throw new Error(`${productResult.data.name} is out of stock.`);
    }

    if (quantity > inventoryQuantity) {
      throw new Error(
        `Only ${inventoryQuantity} ${productResult.data.name} left in stock.`,
      );
    }

    const representativeVariant = activeVariants.find(
      (variant) => typeof variant.price_cents === "number",
    );

    return {
      name: productResult.data.name,
      price: representativeVariant?.price_cents ?? productResult.data.base_price_cents,
      quantity,
    };
  }

  const fallbackPrice = Math.round(Number(item.price) * 100);

  if (!Number.isFinite(fallbackPrice) || fallbackPrice <= 0) {
    throw new Error("Please re-add this item before checkout.");
  }

  return {
    name:
      typeof item.name === "string" && item.name.trim()
        ? item.name.trim()
        : "FORGE Product",
    price: fallbackPrice,
    quantity,
  };
}

export async function POST(req: Request) {
  try {
    const body: { items?: CheckoutItem[] } = await req.json();
    const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];
    const normalizedItems = (
      await Promise.all(items.map((item) => normalizeCheckoutItem(item)))
    ).filter((item) => Number.isFinite(item.price) && item.price > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    const message = err instanceof Error ? err.message : "Stripe failed";
    const isInventoryError =
      message.includes("out of stock") ||
      message.includes("left in stock") ||
      message.includes("re-add your belt size") ||
      message.includes("re-add this item") ||
      message.includes("verify live inventory");

    if (!isInventoryError) {
      console.error("Checkout failed");
    }

    return NextResponse.json(
      { error: message },
      { status: isInventoryError ? 400 : 500 },
    );
  }
}
