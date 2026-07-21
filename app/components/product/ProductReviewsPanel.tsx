import type { Review } from "./productData";

export default function ProductReviewsPanel({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Reviews
        </h2>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
          {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={`${review.name}-${review.date}`}
            className="border border-white/[0.08] bg-[#080808] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-red-400" aria-label={`${review.rating} stars`}>
                {"★".repeat(review.rating)}
                <span className="text-white/15">
                  {"★".repeat(5 - review.rating)}
                </span>
              </span>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/30">
                {review.date}
              </span>
            </div>
            <p className="mt-3 text-sm font-bold text-white">{review.name}</p>
            <p className="mt-2 text-sm leading-6 text-white/55">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
