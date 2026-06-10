import Link from "next/link";

type ForgeLogoProps = {
  href?: string;
  className?: string;
  markClassName?: string;
  variant?: "text" | "mark";
};

export default function ForgeLogo({
  href = "/",
  className = "",
  markClassName = "",
  variant = "text",
}: ForgeLogoProps) {
  if (variant === "mark") {
    return (
      <Link
        href={href}
        className={`group inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${className}`}
        aria-label="FORGE home"
      >
        <svg
          className={`h-9 w-auto text-zinc-100 drop-shadow-[0_0_18px_rgba(220,38,38,0.08)] transition-[filter,transform] duration-300 group-hover:drop-shadow-[0_0_22px_rgba(220,38,38,0.18)] sm:h-11 ${markClassName}`}
          viewBox="0 0 148 104"
          fill="none"
          role="img"
          aria-label="FORGE"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>FORGE</title>
          <path
            d="M14 18H134L125.5 29.5H94L83.5 39.5V55.5L96 43.5H121L112.5 55H99.5L86.5 68V80.5L74 96L61.5 80.5V68L48.5 55H35.5L27 43.5H52L64.5 55.5V39.5L54 29.5H22.5L14 18Z"
            fill="currentColor"
          />
          <path
            d="M69 40H79V82L74 96L69 82V40Z"
            fill="#dc2626"
            className="transition-opacity duration-300 group-hover:opacity-95"
          />
          <path
            d="M61.5 80.5L52 70.5V57.5L61.5 66.5V80.5Z"
            fill="black"
            fillOpacity="0.28"
          />
          <path
            d="M86.5 80.5L96 70.5V57.5L86.5 66.5V80.5Z"
            fill="black"
            fillOpacity="0.28"
          />
          <path
            d="M14 18H134L125.5 29.5H94L83.5 39.5V55.5L96 43.5H121L112.5 55H99.5L86.5 68V80.5L74 96L61.5 80.5V68L48.5 55H35.5L27 43.5H52L64.5 55.5V39.5L54 29.5H22.5L14 18Z"
            stroke="white"
            strokeOpacity="0.22"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M69 40H79V82L74 96L69 82V40Z"
            stroke="#fecaca"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </Link>
    );
  }

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
