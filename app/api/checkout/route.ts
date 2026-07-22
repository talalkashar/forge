import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { InventoryLine } from "@/lib/inventory/stock";
import { getProductBySlug } from "@/lib/products/marketplace";
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
  limit: 12,
  windowMs: 60 * 1000,
};

/** Abuse / DoS caps — real carts stay well under these. */
const MAX_CHECKOUT_BODY_BYTES = 16_384;
const MAX_CHECKOUT_LINE_ITEMS = 12;
const MAX_QUANTITY_PER_LINE = 10;

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
  const rawQuantity = Math.floor(Number(item.quantity) || 1);
  if (!Number.isFinite(rawQuantity) || rawQuantity < 1) {
    throw new Error("Invalid item quantity.");
  }
  if (rawQuantity > MAX_QUANTITY_PER_LINE) {
    throw new Error(
      `Quantity limited to ${MAX_QUANTITY_PER_LINE} per item.`,
    );
  }
  const quantity = rawQuantity;
  const slug =
    typeof item.slug === "string"
      ? item.slug.trim().toLowerCase().slice(0, 64)
      : "";
  const variantId =
    typeof item.variantId === "string" ? item.variantId.slice(0, 128) : "";

  if (!slug) {
    throw new Error("Please re-add this item before checkout.");
  }

  if (beltSlugs.has(slug) && !variantId && !sizeFromItem(item)) {
    throw new Error("Please re-add your belt size before checkout.");
  }

  const productResult = await getProductBySlug(slug);

  // Live inventory is required for catalog products , never sell when stock
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

    // Cart may still hold offline IDs (e.g. "berserk-m") , resolve by size.
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
    const rateLimit = await checkRateLimitAsync(
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

    assertContentLength(req.headers, MAX_CHECKOUT_BODY_BYTES);

    let body: { items?: CheckoutItem[] };
    try {
      body = (await req.json()) as { items?: CheckoutItem[] };
    } catch {
      return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
    }

    const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    if (items.length > MAX_CHECKOUT_LINE_ITEMS) {
      return NextResponse.json(
        {
          error: `Cart limited to ${MAX_CHECKOUT_LINE_ITEMS} line items.`,
        },
        { status: 400 },
      );
    }

    const normalizedItems = (
      await Promise.all(items.map((item) => normalizeCheckoutItem(item)))
    ).filter((item) => Number.isFinite(item.price) && item.price > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const inventoryItems = normalizedItems
      .map((item) => item.inventoryLine)
      .filter((line): line is InventoryLine => Boolean(line));

    // Stripe metadata value max is 500 chars — keep inventory payload tight.
    const inventoryMetadata = JSON.stringify(inventoryItems);
    if (inventoryMetadata.length > 450) {
      return NextResponse.json(
        { error: "Cart is too large for checkout. Remove an item and try again." },
        { status: 400 },
      );
    }

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
        inventory_items: inventoryMetadata,
      },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (isRequestGuardError(err)) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : "Stripe failed";
    const isClientError =
      message.includes("out of stock") ||
      message.includes("left in stock") ||
      message.includes("re-add your belt size") ||
      message.includes("re-add this item") ||
      message.includes("verify live inventory") ||
      message.includes("Invalid item quantity") ||
      message.includes("Quantity limited");

    if (!isClientError) {
      console.error("Checkout failed", message);
    }

    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 500 },
    );
  }
}
