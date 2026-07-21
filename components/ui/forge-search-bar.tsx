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
  placeholder = "Search FORGE GYM",
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
        "group relative isolate w-full overflow-hidden border border-white/12 bg-black transition-[border-color,box-shadow] duration-300 focus-within:border-white/35 focus-within:shadow-[0_0_0_1px_rgba(220,38,38,0.25)]",
        className,
      )}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex min-h-12 items-center gap-3 px-4">
        <Search
          className="h-4 w-4 shrink-0 text-red-500/90"
          aria-hidden="true"
        />
        <label htmlFor={inputId} className="sr-only">
          Search FORGE GYM products
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
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="border border-white/10 p-1.5 text-white/60 transition-colors hover:border-white/25 hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
