"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ForgeSearchBar from "@/components/ui/forge-search-bar";
import { searchProducts, toProductSearchItem } from "@/lib/product-search";
import type { StorefrontProduct } from "@/lib/products";
import type { ProductVariantRow } from "@/lib/products/types";
import ProductCard from "./ProductCard";

type ProductSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  products: StorefrontProduct[];
};

type ShopCatalogResultsProps = {
  sections: ProductSection[];
  showSearch?: boolean;
  category?: "belts" | "straps";
};

const sizeOrder = new Map([
  ["S", 0],
  ["M", 1],
  ["L", 2],
  ["XL", 3],
]);

const storefrontSizeOptions = [
  ["S", "Small"],
  ["M", "Medium"],
  ["L", "Large"],
  ["XL", "XL"],
] as const;

type StorefrontSize = (typeof storefrontSizeOptions)[number][0];

const emptySizeFilters: StorefrontSize[] = [];

function normalizeSize(size: string | null | undefined) {
  return size?.trim().toUpperCase() ?? "";
}

function activeVariants(product: StorefrontProduct) {
  return product.variants.filter((variant) => variant.is_active === true);
}

function variantHasInventory(variant: ProductVariantRow) {
  return (variant.inventory_quantity ?? 0) > 0;
}

function variantMatchesSize(variant: ProductVariantRow, selectedSizes: StorefrontSize[]) {
  if (selectedSizes.length === 0) {
    return true;
  }

  return selectedSizes.includes(normalizeSize(variant.size) as StorefrontSize);
}

function productMatchesFilters(
  product: StorefrontProduct,
  selectedSizes: StorefrontSize[],
  inStockOnly: boolean,
  priceMode: string,
) {
  const variants = activeVariants(product);

  if (priceMode === "under-25" && product.price >= 25) {
    return false;
  }

  if (priceMode === "25-100" && (product.price < 25 || product.price > 100)) {
    return false;
  }

  if (priceMode === "over-100" && product.price <= 100) {
    return false;
  }

  if (selectedSizes.length === 0 && !inStockOnly) {
    return true;
  }

  return variants.some(
    (variant) =>
      variantMatchesSize(variant, selectedSizes) &&
      (!inStockOnly || variantHasInventory(variant)),
  );
}

function parseSizeParam(value: string | null) {
  if (!value) {
    return [];
  }

  const supportedSizes = new Set<StorefrontSize>(
    storefrontSizeOptions.map(([size]) => size),
  );

  return Array.from(
    new Set(
      value
        .split(",")
        .map((size) => size.trim().toUpperCase())
        .filter((size): size is StorefrontSize =>
          supportedSizes.has(size as StorefrontSize),
        ),
    ),
  );
}

export default function ShopCatalogResults({
  sections,
  showSearch = false,
  category,
}: ShopCatalogResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const selectedSizes = useMemo(
    () => parseSizeParam(searchParams.get("size")),
    [searchParams],
  );
  const inStockOnly = searchParams.get("inStock") === "true";
  const priceMode = searchParams.get("price") ?? "all";
  const sortMode = searchParams.get("sort") ?? "featured";
  const updateUrl = useCallback(
    ({
      nextQuery = query,
      nextSizes = selectedSizes,
      nextInStock = inStockOnly,
      nextPrice = priceMode,
      nextSort = sortMode,
    }: {
      nextQuery?: string;
      nextSizes?: StorefrontSize[];
      nextInStock?: boolean;
      nextPrice?: string;
      nextSort?: string;
    }) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (nextQuery.trim()) {
        nextParams.set("q", nextQuery.trim());
      } else {
        nextParams.delete("q");
      }

      if (nextSizes.length > 0) {
        nextParams.set("size", nextSizes.join(","));
      } else {
        nextParams.delete("size");
      }

      if (nextInStock) {
        nextParams.set("inStock", "true");
      } else {
        nextParams.delete("inStock");
      }

      if (nextPrice !== "all") {
        nextParams.set("price", nextPrice);
      } else {
        nextParams.delete("price");
      }

      if (nextSort !== "featured") {
        nextParams.set("sort", nextSort);
      } else {
        nextParams.delete("sort");
      }

      const nextQueryString = nextParams.toString();
      router.replace(
        nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
        { scroll: false },
      );
    },
    [inStockOnly, pathname, priceMode, query, router, searchParams, selectedSizes, sortMode],
  );
  const allProducts = useMemo(
    () => sections.flatMap((section) => section.products),
    [sections],
  );
  const isSingleStrapsCollection =
    category === "straps" && allProducts.length <= 1;
  const sizeOptions = useMemo(() => {
    const availableSizes = new Set(
      allProducts.flatMap((product) =>
        activeVariants(product)
          .map((variant) => normalizeSize(variant.size))
          .filter(Boolean),
      ),
    );

    return storefrontSizeOptions
      .filter(([size]) => availableSizes.has(size))
      .sort(
        ([left], [right]) =>
          (sizeOrder.get(left) ?? Number.MAX_SAFE_INTEGER) -
          (sizeOrder.get(right) ?? Number.MAX_SAFE_INTEGER),
      );
  }, [allProducts]);
  const showFilterBar = !isSingleStrapsCollection;
  const enableSearch = showSearch && showFilterBar;
  const enableSizeFilters =
    showFilterBar && category !== "straps" && sizeOptions.length > 0;
  const enableStockFilter = showFilterBar;
  const enablePriceFilter = showFilterBar;
  const enableSort = showFilterBar;
  const effectiveQuery = enableSearch || (!showSearch && showFilterBar) ? query : "";
  const effectiveSelectedSizes = enableSizeFilters
    ? selectedSizes
    : emptySizeFilters;
  const effectiveInStockOnly = enableStockFilter ? inStockOnly : false;
  const effectivePriceMode = enablePriceFilter ? priceMode : "all";
  const effectiveSortMode = enableSort ? sortMode : "featured";
  const hasFilters =
    showFilterBar &&
    (query.trim().length > 0 ||
      selectedSizes.length > 0 ||
      inStockOnly ||
      priceMode !== "all" ||
      sortMode !== "featured");
  const matchingSlugs = useMemo(() => {
    if (!effectiveQuery.trim()) {
      return null;
    }

    return new Set(
      searchProducts(allProducts.map(toProductSearchItem), effectiveQuery).map(
        (product) => product.slug,
      ),
    );
  }, [allProducts, effectiveQuery]);
  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          products: [...section.products]
            .filter((product) =>
              matchingSlugs ? matchingSlugs.has(product.slug) : true,
            )
            .filter((product) =>
              productMatchesFilters(
                product,
                effectiveSelectedSizes,
                effectiveInStockOnly,
                effectivePriceMode,
              ),
            )
            .sort((left, right) => {
              if (effectiveSortMode === "price-low") {
                return left.price - right.price;
              }

              if (effectiveSortMode === "price-high") {
                return right.price - left.price;
              }

              if (effectiveSortMode === "name") {
                return left.name.localeCompare(right.name);
              }

              return 0;
            }),
        }))
        .filter((section) => section.products.length > 0),
    [
      effectiveInStockOnly,
      effectivePriceMode,
      effectiveSelectedSizes,
      effectiveSortMode,
      matchingSlugs,
      sections,
    ],
  );
  const clearFilters = useCallback(() => {
    updateUrl({
      nextQuery: "",
      nextSizes: [],
      nextInStock: false,
      nextPrice: "all",
      nextSort: "featured",
    });
  }, [updateUrl]);
  const toggleSize = useCallback((size: StorefrontSize) => {
    const nextSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((selectedSize) => selectedSize !== size)
      : [...selectedSizes, size];

    updateUrl({ nextSizes });
  }, [selectedSizes, updateUrl]);
  const updateQuery = useCallback(
    (nextQuery: string) => {
      updateUrl({ nextQuery });
    },
    [updateUrl],
  );
  const updateInStock = useCallback(() => {
    const nextInStock = !inStockOnly;

    updateUrl({ nextInStock });
  }, [inStockOnly, updateUrl]);
  const updateSort = useCallback(
    (nextSort: string) => {
      updateUrl({ nextSort });
    },
    [updateUrl],
  );
  const updatePrice = useCallback(
    (nextPrice: string) => {
      updateUrl({ nextPrice });
    },
    [updateUrl],
  );

  return (
    <div
      className={`mx-auto max-w-7xl ${showFilterBar ? "space-y-10" : "space-y-0"}`}
    >
      {showFilterBar ? (
        <div className="sticky top-20 z-20 grid gap-5 border border-white/[0.08] bg-black p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:p-5 lg:top-24 lg:grid-cols-[minmax(0,1.2fr)_auto_auto_auto] lg:items-end">
          {enableSearch ? (
            <div className="min-w-0">
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/40">
                Search
              </label>
              <ForgeSearchBar
                value={query}
                onChange={updateQuery}
                placeholder="Belt, Zeus, Berserk, straps..."
              />
            </div>
          ) : (
            <div className="hidden md:block" />
          )}

          {enableSizeFilters ? (
            <div>
              <span className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/40">
                Size
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sizeOptions.map(([size]) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    aria-pressed={selectedSizes.includes(size)}
                    className={`h-10 min-w-10 border px-3 text-xs font-black tracking-[0.1em] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${
                      selectedSizes.includes(size)
                        ? "border-red-600 bg-red-600"
                        : "border-white/12 bg-black hover:border-white/30"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {enableStockFilter ? (
            <div>
              <span className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/40">
                Stock
              </span>
              <button
                type="button"
                onClick={updateInStock}
                aria-pressed={inStockOnly}
                className={`h-10 border px-4 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${
                  inStockOnly
                    ? "border-red-600 bg-red-600"
                    : "border-white/12 bg-black hover:border-white/30"
                }`}
              >
                In stock
              </button>
            </div>
          ) : null}

          {enablePriceFilter ? (
            <label className="block">
              <span className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/40">
                Price
              </span>
              <select
                value={priceMode}
                onChange={(event) => updatePrice(event.target.value)}
                className="h-10 w-full border border-white/12 bg-black px-3 text-xs font-semibold text-white outline-none transition-colors focus:border-white/35"
              >
                <option value="all">All</option>
                <option value="under-25">Under $25</option>
                <option value="25-100">$25 to $100</option>
                <option value="over-100">Over $100</option>
              </select>
            </label>
          ) : null}

          {enableSort ? (
            <label className="block">
              <span className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/40">
                Sort
              </span>
              <select
                value={sortMode}
                onChange={(event) => updateSort(event.target.value)}
                className="h-10 w-full border border-white/12 bg-black px-3 text-xs font-semibold text-white outline-none transition-colors focus:border-white/35"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="name">Name</option>
              </select>
            </label>
          ) : null}

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 border border-white/12 px-4 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white/55 transition-colors hover:border-white/30 hover:text-white"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}

      {!showSearch && showFilterBar && query ? (
        <div className="max-w-2xl">
          <ForgeSearchBar value={query} onChange={updateQuery} />
        </div>
      ) : null}

      {visibleSections.length > 0 ? (
        <div className="space-y-14">
          {visibleSections.map((section) => {
            // Category pages already have a page hero , skip repeating the same title.
            const showSectionHeader = visibleSections.length > 1;

            return (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              {showSectionHeader ? (
                <div className="mb-7 flex flex-col gap-2 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                      {section.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                      {section.description}
                    </p>
                  </div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/35">
                    {section.products.length}{" "}
                    {section.products.length === 1 ? "product" : "products"}
                  </span>
                </div>
              ) : null}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {section.products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </section>
            );
          })}
        </div>
      ) : showFilterBar ? (
        <div className="border border-white/[0.08] bg-[#080808] px-6 py-12 text-center">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-red-500">
            No results
          </p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Nothing matches those filters.
          </h2>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-500"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="border border-white/[0.08] bg-[#080808] px-6 py-12 text-center">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-red-500">
            FORGE GYM
          </p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Nothing matches those filters. Clear filters or browse all gear.
          </h2>
        </div>
      )}
    </div>
  );
}
