import "server-only";

import type { StorefrontProduct } from "@/lib/products";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Meta Commerce Manager product catalog (CSV / scheduled feed).
 * One row per active variant SKU. Inventory mirrors Supabase — never invent stock.
 *
 * Spec reference: Meta product catalog fields (id, title, description, availability,
 * condition, price, link, image_link, brand + optional variant fields).
 */

export type MetaCatalogItem = {
  id: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new";
  price: string;
  link: string;
  image_link: string;
  brand: string;
  item_group_id: string;
  size?: string;
  color?: string;
  additional_image_link?: string;
  product_type?: string;
  quantity_to_sell_on_facebook?: number;
};

const CSV_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "item_group_id",
  "size",
  "color",
  "additional_image_link",
  "product_type",
  "quantity_to_sell_on_facebook",
] as const;

function escapeCsvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function cleanText(value: string, max = 5000): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .slice(0, max);
}

function absoluteImageUrl(src: string): string | null {
  if (!src) return null;
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  if (src.startsWith("/")) return absoluteUrl(src);
  return null;
}

function formatPrice(cents: number, currency: string): string {
  const amount = (Math.max(0, cents) / 100).toFixed(2);
  const code = (currency || "USD").toUpperCase();
  return `${amount} ${code}`;
}

function productType(product: StorefrontProduct): string {
  if (product.catalogCategory === "belts") return "Sporting Goods > Exercise & Fitness > Weight Lifting";
  if (product.catalogCategory === "straps") return "Sporting Goods > Exercise & Fitness > Weight Lifting";
  return "Sporting Goods > Exercise & Fitness";
}

/**
 * Build catalog rows from storefront products.
 * Skips inactive variants and products with no image / no SKU.
 */
export function buildMetaCatalogItems(
  products: StorefrontProduct[],
): MetaCatalogItem[] {
  const items: MetaCatalogItem[] = [];

  for (const product of products) {
    if (product.status !== "active") continue;

    const imageLink = absoluteImageUrl(product.images[0] ?? "");
    if (!imageLink) continue;

    const additional = product.images
      .slice(1, 11)
      .map((src) => absoluteImageUrl(src))
      .filter((src): src is string => Boolean(src))
      .join(",");

    const description = cleanText(
      product.descriptionText ||
        product.description ||
        product.intro ||
        `${product.name} from ${site.shortName}.`,
    );
    const brand = cleanText(product.brand || site.shortName, 100);
    const link = absoluteUrl(product.href);
    const activeVariants = (product.variants ?? []).filter(
      (variant) => variant.is_active !== false && Boolean(variant.sku),
    );

    // Prefer one row per active variant (size/color). If none, skip — do not invent SKUs.
    if (activeVariants.length === 0) continue;

    for (const variant of activeVariants) {
      const qty = Math.max(0, variant.inventory_quantity ?? 0);
      const priceCents =
        variant.price_cents ?? product.basePriceCents ?? Math.round(product.price * 100);
      const sizeLabel = variant.size?.trim() || undefined;
      const colorLabel = variant.color?.trim() || undefined;
      const titleParts = [product.name];
      if (sizeLabel) titleParts.push(sizeLabel);
      if (colorLabel && colorLabel.toLowerCase() !== sizeLabel?.toLowerCase()) {
        titleParts.push(colorLabel);
      }

      items.push({
        id: variant.sku,
        title: cleanText(titleParts.join(" — "), 150),
        description,
        availability: qty > 0 ? "in stock" : "out of stock",
        condition: "new",
        price: formatPrice(priceCents, product.currency || "USD"),
        link,
        image_link: imageLink,
        brand,
        item_group_id: product.slug,
        size: sizeLabel,
        color: colorLabel,
        additional_image_link: additional || undefined,
        product_type: productType(product),
        quantity_to_sell_on_facebook: qty,
      });
    }
  }

  return items;
}

export function metaCatalogToCsv(items: MetaCatalogItem[]): string {
  const header = CSV_COLUMNS.join(",");
  const lines = items.map((item) =>
    CSV_COLUMNS.map((column) => escapeCsvCell(item[column])).join(","),
  );
  return `${[header, ...lines].join("\n")}\n`;
}
