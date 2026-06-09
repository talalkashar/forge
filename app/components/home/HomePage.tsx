import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import Footer from "./Footer";
import HeroSlot from "./HeroSlot";
import Navbar from "./Navbar";

const InActionSection = dynamic(() => import("./InActionSection"), {
  loading: () => <section className="min-h-[420px] bg-black" aria-hidden="true" />,
});

const categories = [
  {
    title: "Lever Belts",
    eyebrow: "Belts",
    description:
      "Rigid lever belts for squats, deadlifts, and loaded bracing.",
    href: "/shop/belts",
    image: "/images/lifestyle/berserk-deadlift-lifestyle.png",
    alt: "Athlete deadlifting while wearing the FORGE Berserk lever belt",
    imageClassName: "object-cover",
  },
  {
    title: "Wrist Straps",
    eyebrow: "Straps",
    description:
      "Padded straps for deadlifts, rows, pull-ups, and pull days.",
    href: "/shop/wrist-straps",
    image: "/images/lifestyle/forge-straps-deadlift-lifestyle.png",
    alt: "Athlete gripping a loaded barbell with FORGE wrist straps",
    imageClassName: "object-cover",
  },
];

const featuredGear = [
  {
    title: "Zeus Lever Belt",
    description:
      "Fast lever closure with a locked-in 10mm feel.",
    href: "/product/belt?variant=zeus",
    image: "/images/belts/listing/zeus/1.webp",
    meta: "Lever Belt",
  },
  {
    title: "Berserk Lever Belt",
    description:
      "A bold belt finish on the same rigid platform.",
    href: "/product/belt?variant=berserk",
    image: "/images/belts/listing/berserk/1.webp",
    meta: "Lever Belt",
  },
  {
    title: "FORGE Wrist Straps",
    description:
      "Grip help for pulls, rows, and longer back sessions.",
    href: "/product/straps",
    image: "/images/straps/listing/1-removebg.webp",
    meta: "Wrist Straps",
  },
];

const trustMessages = [
  "Secure checkout",
  "Easy returns",
  "Built for heavy training",
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSlot />

        <section className="bg-[linear-gradient(180deg,#050505,#000)] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl">
              <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-red-500/90">
                Shop by Category
              </p>
              <h2 className="text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl md:text-5xl">
                Choose your gear.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                Go straight to the category you need.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.title}
                  href={category.href}
                  className="group overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,21,21,0.98),rgba(5,5,5,1))] shadow-[0_18px_52px_rgba(0,0,0,0.3)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-red-600/45 hover:shadow-[0_24px_68px_rgba(0,0,0,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                >
                  <div className="relative aspect-[16/11] overflow-hidden border-b border-white/8 bg-neutral-950">
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={75}
                      className={`${category.imageClassName} transition-transform duration-500 group-hover:scale-[1.04]`}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.72))]" />
                  </div>
                  <div className="p-6 sm:p-7">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-red-500/90">
                      {category.eyebrow}
                    </p>
                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-3xl font-black tracking-normal text-white">
                          {category.title}
                        </h3>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400 sm:text-base">
                          {category.description}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 rounded-full border border-red-600/50 bg-red-600/0 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition-[transform,border-color,background-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:border-red-500 group-hover:bg-red-600/12 group-hover:shadow-[0_12px_28px_rgba(220,38,38,0.14)]">
                        Shop
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-red-500/90">
                  Featured Gear
                </p>
                <h2 className="text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl md:text-5xl">
                  Main lineup.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                  The core products, ready to shop.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex w-fit rounded-full border border-red-600/45 bg-red-600/0 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-600/12 hover:shadow-[0_12px_28px_rgba(220,38,38,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
              >
                View All Gear
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {featuredGear.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,21,21,0.98),rgba(5,5,5,1))] shadow-[0_18px_52px_rgba(0,0,0,0.3)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-red-600/45 hover:shadow-[0_24px_68px_rgba(0,0,0,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_42%),linear-gradient(180deg,rgba(18,18,18,0.95),rgba(8,8,8,1))]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={75}
                      className="object-contain p-7 transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-red-500/90">
                      {item.meta}
                    </p>
                    <h3 className="text-2xl font-black tracking-normal text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-400">
                      {item.description}
                    </p>
                    <span className="mt-5 w-fit rounded-full border border-red-600/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-[transform,border-color,background-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:border-red-500 group-hover:bg-red-600/12 group-hover:shadow-[0_12px_28px_rgba(220,38,38,0.14)]">
                      Shop Product
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-red-600/16 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.14),transparent_42%),#050505] px-6 py-10 sm:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
            {trustMessages.map((message) => (
              <div
                key={message}
                className="rounded-[1rem] border border-white/10 bg-black/45 px-5 py-4 text-center text-sm font-semibold text-white"
              >
                {message}
              </div>
            ))}
          </div>
        </section>

        <InActionSection />
      </main>
      <Footer />
    </>
  );
}
