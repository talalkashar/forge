"use client";

import { Search, X } from "lucide-react";
import { FormEvent, useId } from "react";
import { cn } from "@/lib/utils";

type ForgeSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export default function ForgeSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search FORGE gear",
  className,
  autoFocus = false,
}: ForgeSearchBarProps) {
  const inputId = useId();
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      className={cn(
        "group relative isolate w-full overflow-hidden rounded-full border border-white/12 bg-black shadow-[0_18px_44px_rgba(0,0,0,0.32)] transition-[border-color,box-shadow] duration-300 focus-within:border-red-500/70 focus-within:shadow-[0_0_0_1px_rgba(220,38,38,0.36),0_18px_52px_rgba(220,38,38,0.12)]",
        className,
      )}
      onSubmit={handleSubmit}
      role="search"
    >
      <div
        className="pointer-events-none absolute -inset-px -z-10 rounded-full bg-[radial-gradient(circle_at_20%_50%,rgba(220,38,38,0.28),transparent_28%),radial-gradient(circle_at_80%_50%,rgba(127,29,29,0.2),transparent_28%)] opacity-45 blur-xl transition-opacity duration-300 group-focus-within:opacity-80"
        aria-hidden="true"
      />
      <div className="flex min-h-12 items-center gap-3 px-4 sm:min-h-14 sm:px-5">
        <Search className="h-5 w-5 shrink-0 text-red-500/90" aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          Search FORGE products
        </label>
        <input
          id={inputId}
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit?.(value);
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/38 sm:text-lg"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/70 transition-[border-color,background-color,color] duration-200 hover:border-red-500/55 hover:bg-red-600/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
