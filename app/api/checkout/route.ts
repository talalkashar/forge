import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { InventoryLine } from "@/lib/inventory/stock";
import { getProductBySlug } from "@/lib/products/marketplace";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutItem = {
  slug?: string;
  variantId?: string;
  name?: string;
  price?: number;
  quantity: number;
  size?: string;
};

type NormalizedCheckoutItem = {
  name: string;
  price: number;
  quantity: number;
  inventoryLine: InventoryLine | null;
};

const beltSlugs = new Set(["zeus", "berserk", "black"]);

/** Known catalog SKUs that must verify live Supabase inventory before checkout. */
const LIVE_CATALOG_SLUGS = new Set(["zeus", "berserk", "black", "straps"]);

const checkoutRateLimit = {
  limit: 20,
  windowMs: 60 * 1000,
};

function normalizeSize(size: string | null | undefined) {
  return size?.trim().toUpperCase() ?? "";
}

function sizeFromItem(item: CheckoutItem) {
  if (typeof item.size === "string" && item.size.trim()) {
    return normalizeSize(item.size);
  }

  if (typeof item.name === "string") {
    const match = item.name.match(/\b(XXL|XL|XS|S|M|L)\b/i);
    if (match) {
      return normalizeSize(match[1]);
    }
  }

  if (typeof item.variantId === "string") {
    const match = item.variantId.match(/(?:^|-)(xxl|xl|xs|s|m|l)$/i);
    if (match) {
      return normalizeSize(match[1]);
    }
  }

  return "";
}

async function normalizeCheckoutItem(
  item: CheckoutItem,
): Promise<NormalizedCheckoutItem> {
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const slug = typeof item.slug === "string" ? item.slug.trim().toLowerCase() : "";
  const variantId = typeof item.variantId === "string" ? item.variantId : "";

  if (!slug) {
    throw new Error("Please re-add this item before checkout.");
  }

  if (beltSlugs.has(slug) && !variantId && !sizeFromItem(item)) {
    throw new Error("Please re-add your belt size before checkout.");
  }

  const productResult = await getProductBySlug(slug);

  // Live inventory is required for catalog products — never sell when stock
  // cannot be verified against Supabase.
  if (productResult.error || productResult.missingEnv || !productResult.data) {
    if (LIVE_CATALOG_SLUGS.has(slug)) {
      throw new Error(
        "Unable to verify live inventory. Please try checkout again in a moment.",
      );
    }

    throw new Error("Please re-add this item before checkout.");
  }

  const variants = productResult.data.product_variants ?? [];
  const requestedSize = sizeFromItem(item);

  if (variantId || requestedSize) {
    let variant =
      (variantId
        ? variants.find((productVariant) => productVariant.id === variantId)
        : undefined) ?? null;

    // Cart may still hold offline IDs (e.g. "berserk-m") — resolve by size.
    if (!variant && requestedSize) {
      variant =
        variants.find(
          (productVariant) =>
            normalizeSize(productVariant.size) === requestedSize,
        ) ?? null;
    }

    if (!variant || variant.is_active !== true) {
      throw new Error(`${productResult.data.name} is out of stock.`);
    }

    const inventoryQuantity = variant.inventory_quantity ?? 0;

    if (inventoryQuantity <= 0) {
      throw new Error(
        `${productResult.data.name} ${variant.size ?? ""} is out of stock.`,
      );
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
      inventoryLine: {
        variantId: variant.id,
        sku: variant.sku,
        quantity,
      },
    };
  }

  const activeVariants = variants.filter((variant) => variant.is_active === true);
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

  const representativeVariant =
    activeVariants.find((variant) => (variant.inventory_quantity ?? 0) > 0) ??
    activeVariants[0];

  return {
    name: productResult.data.name,
    price:
      representativeVariant?.price_cents ?? productResult.data.base_price_cents,
    quantity,
    inventoryLine: representativeVariant
      ? {
          variantId: representativeVariant.id,
          sku: representativeVariant.sku,
          quantity,
        }
      : null,
  };
}

function allowedCheckoutOrigin(req: Request) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const fallbackOrigin = configuredBaseUrl || "http://localhost:3001";
  const requestOrigin = req.headers.get("origin");

  const allowedOrigins = new Set(
    [
      configuredBaseUrl,
      "https://capacitygears.com",
      "https://forgegym.us",
      "https://www.forgegym.us",
      "http://localhost:3000",
      "http://localhost:3001",
    ]
      .filter(Boolean)
      .map((value) => new URL(value as string).origin),
  );

  if (requestOrigin) {
    try {
      const originUrl = new URL(requestOrigin);
      const isLocalhost =
        ["localhost", "127.0.0.1"].includes(originUrl.hostname) &&
        ["http:", "https:"].includes(originUrl.protocol);

      if (allowedOrigins.has(originUrl.origin) || isLocalhost) {
        return originUrl.origin;
      }
    } catch {
      // Fall through to the configured safe origin.
    }
  }

  return new URL(fallbackOrigin).origin;
}

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(
      `checkout:${clientIp(req.headers)}`,
      checkoutRateLimit,
    );

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Checkout is not configured yet." },
        { status: 500 },
      );
    }

    const body: { items?: CheckoutItem[] } = await req.json();
    const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];
    const normalizedItems = (
      await Promise.all(items.map((item) => normalizeCheckoutItem(item)))
    ).filter((item) => Number.isFinite(item.price) && item.price > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const inventoryItems = normalizedItems
      .map((item) => item.inventoryLine)
      .filter((line): line is InventoryLine => Boolean(line));

    const origin = allowedCheckoutOrigin(req);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      // Used by /api/webhooks/stripe to decrement live Supabase inventory.
      metadata: {
        inventory_items: JSON.stringify(inventoryItems),
      },
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
      console.error("Checkout failed", message);
    }

    return NextResponse.json(
      { error: message },
      { status: isInventoryError ? 400 : 500 },
    );
  }
}
