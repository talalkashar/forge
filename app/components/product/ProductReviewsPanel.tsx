"use client";

import { memo } from "react";
import type { Review } from "./productData";

function ProductReviewsPanel({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      <div className="mb-8 rounded-[1.75rem] border border-white/8 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-400/15 p-2.5">
              <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Customer Reviews</h3>
              <p className="mt-1 text-sm text-gray-400">Feedback from verified customers.</p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-semibold text-yellow-400">
            Verified
          </span>
        </div>
      </div>
      <div className="space-y-5">
        {reviews.map((review) => (
          <div key={`${review.name}-${review.date}`} className="rounded-[1.5rem] border border-white/8 bg-gradient-to-b from-neutral-900 to-black p-6 shadow-[0_16px_50px_rgba(0,0,0,0.24)] sm:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-yellow-400">
                {"★".repeat(review.rating)}
                <span className="text-white/20">
                  {"☆".repeat(5 - review.rating)}
                </span>
              </span>
              <span className="font-bold text-white">{review.name}</span>
              <span className="text-sm text-gray-400">Verified purchase</span>
            </div>
            <p className="mb-3 text-sm text-gray-400">{review.date}</p>
            <p className="text-base leading-7 text-gray-300">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

ProductReviewsPanel.displayName = "ProductReviewsPanel";

export default memo(ProductReviewsPanel);
