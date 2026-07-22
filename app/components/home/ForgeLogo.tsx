import Link from "next/link";

type ForgeLogoProps = {
  href?: string;
  className?: string;
  /** Size scale for the stacked belt wordmark */
  markClassName?: string;
  /** @deprecated Kept for call-site compatibility , logo is always the belt lockup */
  variant?: "text" | "mark";
};

/**
 * Product emboss lockup:
 *   FORGE
 * GYM between horizontal rules 
 * Matches the logo stamped on the lever belts.
 */
export default function ForgeLogo({
  href = "/",
  className = "",
  markClassName = "",
}: ForgeLogoProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${className}`}
      aria-label="FORGE GYM home"
    >
      <span
        className={`flex flex-col items-center leading-none text-white transition-opacity duration-200 group-hover:opacity-80 ${markClassName}`}
      >
        <span className="text-[1.05em] font-black uppercase tracking-[0.22em]">
          FORGE
        </span>
        <span className="mt-[0.22em] flex items-center gap-[0.35em] text-[0.38em] font-bold uppercase tracking-[0.32em]">
          <span
            className="h-px w-[1.15em] bg-current opacity-75"
            aria-hidden="true"
          />
          GYM
          <span
            className="h-px w-[1.15em] bg-current opacity-75"
            aria-hidden="true"
          />
        </span>
      </span>
    </Link>
  );
}
