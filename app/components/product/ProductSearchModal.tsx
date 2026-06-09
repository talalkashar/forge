"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import ForgeSearchBar from "@/components/ui/forge-search-bar";
import type { ProductSearchItem } from "@/lib/product-search";

type ProductSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function ProductSearchModal({
  isOpen,
  onClose,
}: ProductSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const trimmedQuery = query.trim();
  const headingText = useMemo(
    () => (trimmedQuery ? "Matching gear" : "Start with a product or lift"),
    [trimmedQuery],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (
        event.key === "Enter" &&
        trimmedQuery &&
        results.length > 0 &&
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "search"
      ) {
        event.preventDefault();
        onClose();
        router.push(results[0].href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, results, router, trimmedQuery]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/search-products?q=${encodeURIComponent(query)}&limit=6`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as { products?: ProductSearchItem[] };
        setResults(payload.products ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 120);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isOpen, query]);

  if (!isOpen) {
    return null;
  }

  const submitSearch = () => {
    if (!trimmedQuery || results.length === 0) {
      return;
    }

    onClose();
    router.push(results[0].href);
  };

  const openProduct = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/82 px-4 py-5 backdrop-blur-md sm:px-6 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forge-search-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mx-auto flex min-h-full max-w-3xl items-start sm:items-center">
        <div className="relative w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(4,4,4,1))] shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-red-600/12 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative border-b border-white/8 p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-red-500/90">
                  Product Search
                </p>
                <h2
                  id="forge-search-title"
                  className="text-2xl font-black tracking-normal text-white sm:text-3xl"
                >
                  Find your gear.
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/70 transition-[border-color,background-color,color] duration-200 hover:border-red-500/55 hover:bg-red-600/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                aria-label="Close search"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <ForgeSearchBar
              value={query}
              onChange={setQuery}
              onSubmit={submitSearch}
              placeholder="Try berserk, berseka, zeus, straps..."
              autoFocus
            />
          </div>

          <div className="relative p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
                {headingText}
              </h3>
              {isLoading ? (
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
                  Searching
                </span>
              ) : null}
            </div>

            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((product) => (
                  <a
                    key={product.slug}
                    href={product.href}
                    onClick={(event) => {
                      event.preventDefault();
                      openProduct(product.href);
                    }}
                    className="group grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-[1rem] border border-white/8 bg-white/[0.03] p-3 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-red-600/45 hover:bg-red-600/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 sm:grid-cols-[88px_minmax(0,1fr)_auto]"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.16),transparent_42%),#070707]">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="88px"
                          quality={70}
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.05]"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 self-center">
                      <p className="mb-1 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-red-500/90">
                        {product.category}
                      </p>
                      <h4 className="truncate text-base font-black text-white sm:text-lg">
                        {product.name}
                      </h4>
                      <p className="mt-1 line-clamp-1 text-sm text-gray-400">
                        {product.description}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-3 border-t border-white/8 pt-3 sm:col-span-1 sm:border-t-0 sm:pt-0">
                      <span className="text-lg font-black text-red-500">
                        {formatPrice(product.price)}
                      </span>
                      <span className="rounded-full border border-red-600/40 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white transition-colors group-hover:bg-red-600/12">
                        View
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-5 text-sm leading-6 text-gray-400">
                {trimmedQuery
                  ? "No matching gear found. Try belt, zeus, berserk, or straps."
                  : "Search by product, category, lift, or nickname."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
