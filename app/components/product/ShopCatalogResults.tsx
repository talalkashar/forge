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
  const hasFilters =
    query.trim().length > 0 ||
    selectedSizes.length > 0 ||
    inStockOnly ||
    priceMode !== "all" ||
    sortMode !== "featured";
  const matchingSlugs = useMemo(() => {
    if (!query.trim()) {
      return null;
    }

    return new Set(
      searchProducts(allProducts.map(toProductSearchItem), query).map(
        (product) => product.slug,
      ),
    );
  }, [allProducts, query]);
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
              productMatchesFilters(product, selectedSizes, inStockOnly, priceMode),
            )
            .sort((left, right) => {
              if (sortMode === "price-low") {
                return left.price - right.price;
              }

              if (sortMode === "price-high") {
                return right.price - left.price;
              }

              if (sortMode === "name") {
                return left.name.localeCompare(right.name);
              }

              return 0;
            }),
        }))
        .filter((section) => section.products.length > 0),
    [inStockOnly, matchingSlugs, priceMode, sections, selectedSizes, sortMode],
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
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="grid gap-4 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] lg:items-end">
        {showSearch ? (
          <div className="min-w-0">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/55">
              Search
            </label>
            <ForgeSearchBar
              value={query}
              onChange={updateQuery}
              placeholder="Filter by belt, zeus, berserk, straps..."
            />
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        {sizeOptions.length > 0 ? (
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/55">
              Size
            </span>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map(([size, label]) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  aria-pressed={selectedSizes.includes(size)}
                  className={`h-12 min-w-12 rounded-xl border px-4 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${
                    selectedSizes.includes(size)
                      ? "border-red-500 bg-red-600/25"
                      : "border-white/10 bg-black hover:border-red-600/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            Stock
          </span>
          <button
            type="button"
            onClick={updateInStock}
            aria-pressed={inStockOnly}
            className={`h-12 rounded-xl border px-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${
              inStockOnly
                ? "border-red-500 bg-red-600/25"
                : "border-white/10 bg-black hover:border-red-600/60"
            }`}
          >
            In Stock Only
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            Price
          </span>
          <select
            value={priceMode}
            onChange={(event) => updatePrice(event.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white outline-none transition-colors focus:border-red-600"
          >
            <option value="all">All prices</option>
            <option value="under-25">Under $25</option>
            <option value="25-100">$25 to $100</option>
            <option value="over-100">Over $100</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            Sort
          </span>
          <select
            value={sortMode}
            onChange={(event) => updateSort(event.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white outline-none transition-colors focus:border-red-600"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="h-12 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-white/20 hover:text-white lg:col-start-4"
          >
            Clear
          </button>
        ) : null}
      </div>

      {!showSearch && query ? (
        <div className="max-w-2xl">
          <ForgeSearchBar value={query} onChange={updateQuery} />
        </div>
      ) : null}

      {visibleSections.length > 0 ? (
        <div className="space-y-14">
          {visibleSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
                    {section.eyebrow}
                  </p>
                  <h2 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                    {section.description}
                  </p>
                </div>
                <span className="text-sm font-semibold text-white/55">
                  {section.products.length}{" "}
                  {section.products.length === 1 ? "product" : "products"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {section.products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500/90">
            No Results
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            No gear matches those filters.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400">
            Adjust the selected sizes or stock filter to see what is currently available.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-xl border border-red-600/45 bg-red-600/12 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
