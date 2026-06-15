import type { Review } from "./productData";

export default function ProductReviewsPanel({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    const reviewStandards = [
      ["Verified only", "Ratings will appear only when tied to completed customer orders."],
      ["Post-purchase capture", "Review requests are planned after Stripe order records are fully wired."],
      ["No placeholder stars", "FORGE will not show fake ratings or unverified testimonials."],
    ];

    return (
      <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(5,5,5,1))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-8">
        <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
          Reviews
        </p>
        <h2 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
          Reviews coming from verified customers.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-400 sm:text-base">
          FORGE is only showing customer feedback after it can be tied to real
          orders. Review capture will be added after Stripe order records are
          connected to the storefront.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {reviewStandards.map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/8 bg-black/35 p-4"
            >
              <h3 className="text-sm font-black text-white">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-gray-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
