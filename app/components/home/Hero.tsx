import Image from "next/image";
import Link from "next/link";

/** Static hero — no scroll-linked JS (keeps trackpads smooth). */
export default function Hero() {
  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black"
      aria-label="FORGE GYM hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 h-[120%] w-full -top-[10%]" data-speed="0.85">
        <Image
          src="/images/lifestyle/berserk-deadlift-lifestyle.jpg"
          alt="Athlete deadlifting in a FORGE GYM lever belt"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-[center_28%]"
        />
        </div>
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_36%,rgba(0,0,0,0.25)_58%,rgba(0,0,0,0.55)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,transparent_30%,transparent_55%,rgba(0,0,0,0.9)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_38%,rgba(160,20,20,0.16),transparent_48%)]"
          aria-hidden="true"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-28 sm:px-8 sm:pb-20 lg:pb-24">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-12 bg-red-500" aria-hidden="true" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-red-400">
                FORGE GYM™
              </p>
            </div>

            <h1 className="text-[clamp(3.4rem,10vw,7.2rem)] font-black leading-[0.84] tracking-[-0.04em] text-white">
              Built for
              <span className="mt-1 block text-red-500">heavy work.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Lever belts and wrist straps for serious training — rigid support,
              clean hardware, zero soft branding.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/shop/belts"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80"
              >
                Shop Belts
              </Link>
              <Link
                href="/shop/wrist-straps"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/[0.03] px-9 py-3.5 text-[0.7rem] font-black uppercase tracking-[0.2em] text-white transition-colors hover:border-white/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                Shop Straps
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
