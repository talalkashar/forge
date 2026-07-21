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
    () => (trimmedQuery ? "Results" : "Search belts, straps, sizes…"),
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
        const payload = (await response.json()) as {
          products?: ProductSearchItem[];
        };
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

  if (!isOpen) {
    return null;
  }

  return (
        <div
          className="fixed inset-0 z-[100] bg-black/90 px-4 py-5 sm:px-6 sm:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forge-search-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <div className="mx-auto flex min-h-full max-w-2xl items-start sm:items-center">
            <div className="relative w-full overflow-hidden border border-white/[0.1] bg-[#070707] shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
              <div
                className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-red-600/20 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative border-b border-white/[0.08] p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-red-500">
                      FORGE GYM™
                    </p>
                    <h2
                      id="forge-search-title"
                      className="text-2xl font-black tracking-tight text-white sm:text-3xl"
                    >
                      Search
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="border border-white/12 p-2 text-white/70 transition-colors hover:border-white/30 hover:text-white"
                    aria-label="Close search"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <ForgeSearchBar
                  value={query}
                  onChange={setQuery}
                  onSubmit={submitSearch}
                  placeholder="Berserk, Zeus, straps, belt..."
                  autoFocus
                />
              </div>

              <div className="relative p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/45">
                    {headingText}
                  </h3>
                  {isLoading ? (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-red-400">
                      Searching
                    </span>
                  ) : null}
                </div>

                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((product) => (
                      <a
                        key={product.slug}
                        href={product.href}
                        onClick={(event) => {
                          event.preventDefault();
                          openProduct(product.href);
                        }}
                        className="group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border border-white/[0.08] bg-black/40 p-3 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.03]"
                      >
                        <div className="relative aspect-square overflow-hidden border border-white/[0.06] bg-[radial-gradient(circle_at_50%_30%,rgba(120,20,20,0.2),transparent_55%),#0a0a0a]">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="64px"
                              quality={82}
                              className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-red-400/90">
                            FORGE GYM
                          </p>
                          <h4 className="truncate text-sm font-black text-white sm:text-base">
                            {product.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">
                            {formatPrice(product.price)}
                          </p>
                          <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/35 transition-colors group-hover:text-white/70">
                            View →
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="border border-white/[0.08] bg-black/30 p-5 text-sm leading-6 text-white/45">
                    {trimmedQuery
                      ? "No matches. Try belt, Zeus, Berserk, or straps."
                      : "Search by product name, finish, or category."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  );
}
