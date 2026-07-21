"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import {
  BELT_SIZE_CHART_BETWEEN_SIZES,
  BELT_SIZE_CHART_MEASURE_TIP,
  BELT_SIZE_CHART_ROWS,
  type BeltSizeChartRow,
} from "./beltSizeChartData";
import { FixedPortal } from "@/app/components/providers/FixedPortal";

type BeltSizeChartTableProps = {
  rows?: readonly BeltSizeChartRow[];
  availableSizes?: string[];
  compact?: boolean;
  className?: string;
};

function normalizeSize(size: string) {
  return size.trim().toUpperCase();
}

export function BeltSizeChartTable({
  rows = BELT_SIZE_CHART_ROWS,
  availableSizes,
  compact = false,
  className = "",
}: BeltSizeChartTableProps) {
  const available =
    availableSizes && availableSizes.length > 0
      ? new Set(availableSizes.map(normalizeSize))
      : null;

  return (
    <div
      className={`overflow-hidden rounded-none border border-white/10 bg-black/40 ${className}`}
    >
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          FORGE GYM lever belt size chart by waist measurement
        </caption>
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04] text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/70">
            <th scope="col" className="px-3 py-3 sm:px-4">
              Size
            </th>
            <th scope="col" className="px-3 py-3 sm:px-4">
              Waist (in)
            </th>
            <th scope="col" className="px-3 py-3 sm:px-4">
              Waist (cm)
            </th>
            {available ? (
              <th scope="col" className="hidden px-3 py-3 sm:table-cell sm:px-4">
                Catalog
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isListed = available?.has(row.size) ?? true;
            const stockLabel = !available
              ? null
              : isListed
                ? "In catalog"
                : "Not listed";

            return (
              <tr
                key={row.size}
                className={`border-t border-white/8 text-sm ${
                  available && !isListed ? "opacity-45" : ""
                }`}
              >
                <th
                  scope="row"
                  className={`px-3 font-black tracking-[0.12em] text-white sm:px-4 ${
                    compact ? "py-2.5" : "py-3.5"
                  }`}
                >
                  {row.size}
                </th>
                <td
                  className={`px-3 text-white/60 sm:px-4 ${compact ? "py-2.5" : "py-3.5"}`}
                >
                  {row.inches}
                </td>
                <td
                  className={`px-3 text-white/60 sm:px-4 ${compact ? "py-2.5" : "py-3.5"}`}
                >
                  {row.cm}
                </td>
                {available ? (
                  <td
                    className={`hidden px-3 text-xs font-semibold uppercase tracking-[0.1em] sm:table-cell sm:px-4 ${
                      compact ? "py-2.5" : "py-3.5"
                    } ${isListed ? "text-emerald-300/90" : "text-white/40"}`}
                  >
                    {stockLabel}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type BeltSizeChartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  productName?: string;
  availableSizes?: string[];
};

export function BeltSizeChartModal({
  isOpen,
  onClose,
  imageSrc,
  productName = "FORGE lever belt",
  availableSizes,
}: BeltSizeChartModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <FixedPortal>
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[min(92vh,920px)] w-full max-w-3xl overflow-y-auto rounded-none border border-white/12 bg-[#080808] shadow-2xl shadow-black/80"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-black/85 px-5 py-4 backdrop-blur-md sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-red-500/90">
              Size Chart
            </p>
            <h2
              id={titleId}
              className="mt-1 text-xl font-black tracking-[-0.03em] text-white sm:text-2xl"
            >
              {productName}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-red-500/50 hover:bg-red-600/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="relative aspect-square overflow-hidden rounded-none border border-white/10 bg-neutral-950 sm:aspect-[5/4]">
            <Image
              src={imageSrc}
              alt={`${productName} size chart with waist measurements for S through XXL`}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              quality={86}
              className="object-contain"
              priority
            />
          </div>

          <BeltSizeChartTable availableSizes={availableSizes} compact />

          <div className="space-y-2 rounded-none border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/60">
            <p>
              <span className="font-black text-white">How to measure:</span>{" "}
              {BELT_SIZE_CHART_MEASURE_TIP}
            </p>
            <p>
              <span className="font-black text-white">Between sizes:</span>{" "}
              {BELT_SIZE_CHART_BETWEEN_SIZES}
            </p>
          </div>
        </div>
      </div>
    </div>
    </FixedPortal>
  );
}

type BeltSizeChartTriggerProps = {
  onOpen: () => void;
  className?: string;
};

export function BeltSizeChartTrigger({
  onOpen,
  className = "",
}: BeltSizeChartTriggerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`inline-flex items-center justify-center rounded-full border border-red-600/45 bg-red-600/10 px-3.5 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-600/18 hover:shadow-[0_10px_24px_rgba(220,38,38,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${className}`}
    >
      View size chart
    </button>
  );
}
