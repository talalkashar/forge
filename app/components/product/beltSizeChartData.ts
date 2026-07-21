/**
 * Official FORGE lever belt size chart.
 * Matches the "How to measure your quick locking belt" listing image.
 */
export type BeltSizeChartRow = {
  size: string;
  inches: string;
  cm: string;
};

export const BELT_SIZE_CHART_ROWS: readonly BeltSizeChartRow[] = [
  { size: "S", inches: '28" – 32"', cm: "71 – 81 cm" },
  { size: "M", inches: '32" – 36"', cm: "82 – 91 cm" },
  { size: "L", inches: '36" – 40"', cm: "91 – 101 cm" },
  { size: "XL", inches: '40" – 44"', cm: "101 – 111 cm" },
  { size: "XXL", inches: '44" – 48"', cm: "111 – 121 cm" },
] as const;

export const BELT_SIZE_CHART_IMAGE_BY_SLUG: Record<string, string> = {
  zeus: "/images/belts/listing/zeus/gallery-v2-2.jpg",
  berserk: "/images/belts/listing/berserk/4.jpg",
  black: "/images/belts/listing/Black Lever Belt/3.jpg",
};

export const BELT_SIZE_CHART_MEASURE_TIP =
  "Measure around your waist where the belt will sit, usually around the navel (belly button). Do not use pants size.";

export const BELT_SIZE_CHART_BETWEEN_SIZES =
  "If you are between sizes, size down for a firmer brace, or contact support before ordering.";

export function resolveBeltSizeChartImage(product: {
  slug: string;
  images?: string[];
}): string {
  const preferred = BELT_SIZE_CHART_IMAGE_BY_SLUG[product.slug];
  if (preferred) {
    return preferred;
  }

  const fromGallery = product.images?.find(
    (image) =>
      image.includes("/listing/") &&
      /\/3\.(webp|png|jpe?g)$/i.test(image),
  );

  return fromGallery ?? BELT_SIZE_CHART_IMAGE_BY_SLUG.zeus;
}

export function getBeltSizeChartRow(size: string): BeltSizeChartRow | undefined {
  const normalized = size.trim().toUpperCase();
  return BELT_SIZE_CHART_ROWS.find((row) => row.size === normalized);
}

export function formatBeltSizeRange(size: string): string | null {
  const row = getBeltSizeChartRow(size);
  if (!row) {
    return null;
  }

  return `${row.inches} (${row.cm})`;
}
