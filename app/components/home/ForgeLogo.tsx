import Link from "next/link";

type ForgeLogoProps = {
  href?: string;
  className?: string;
  markClassName?: string;
};

export default function ForgeLogo({
  href = "/",
  className = "",
  markClassName = "",
}: ForgeLogoProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="FORGE home"
    >
      <span
        className={`forge-logo-text font-black uppercase tracking-[0.18em] text-white ${markClassName}`}
      >
        FORGE
      </span>
      <span className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_18px_rgba(220,38,38,0.75)] transition-transform duration-300 group-hover:scale-125" />
    </Link>
  );
}
