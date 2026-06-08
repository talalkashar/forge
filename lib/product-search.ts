import type { StorefrontProduct } from "@/lib/products";

export type ProductSearchItem = {
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  href: string;
  image: string;
  variant: string;
  aliases: string[];
};

const productAliases: Record<string, string[]> = {
  berserk: [
    "berseka",
    "berserk",
    "anime belt",
    "lever belt",
    "belt",
    "lifting belt",
  ],
  zeus: ["zeus", "god belt", "blue belt", "lever belt", "belt", "lifting belt"],
  black: ["black belt", "lever belt", "gym belt", "belt", "lifting belt"],
  straps: [
    "straps",
    "wrist straps",
    "deadlift straps",
    "pulling straps",
    "rows",
    "back day",
    "pull day",
  ],
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 2) {
    return 3;
  }

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + cost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

export function toProductSearchItem(product: StorefrontProduct): ProductSearchItem {
  const aliases = productAliases[product.slug] ?? [];

  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    category: product.category,
    description: product.description,
    href: product.href,
    image: product.images[0] ?? "",
    variant: product.slug,
    aliases,
  };
}

function scoreProduct(product: ProductSearchItem, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);

  if (!query) {
    return 1;
  }

  const searchableText = normalizeSearchText(
    [
      product.name,
      product.category,
      product.variant,
      product.description,
      ...product.aliases,
    ].join(" "),
  );
  const queryTokens = query.split(" ").filter(Boolean);
  const searchableTokens = searchableText.split(" ").filter(Boolean);
  let score = 0;

  if (searchableText.includes(query)) {
    score += 80;
  }

  for (const alias of product.aliases) {
    const normalizedAlias = normalizeSearchText(alias);

    if (normalizedAlias === query) {
      score += 100;
    } else if (normalizedAlias.includes(query) || query.includes(normalizedAlias)) {
      score += 40;
    }
  }

  for (const queryToken of queryTokens) {
    if (searchableTokens.includes(queryToken)) {
      score += 12;
      continue;
    }

    if (
      queryToken.length >= 5 &&
      searchableTokens.some((token) => editDistance(queryToken, token) <= 2)
    ) {
      score += 8;
    }
  }

  return score;
}

export function searchProducts(
  products: ProductSearchItem[],
  query: string,
  limit = products.length,
) {
  return products
    .map((product, index) => ({
      product,
      index,
      score: scoreProduct(product, query),
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((result) => result.product);
}
