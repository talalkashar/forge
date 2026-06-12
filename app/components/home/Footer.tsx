"use client";

import Link from "next/link";
import {
  ArrowUp,
  Dumbbell,
  Heart,
  Mail,
  Music2,
} from "lucide-react";
import ForgeLogo from "./ForgeLogo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect width="17" height="17" x="3.5" y="3.5" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M17.5 6.8h.01" strokeLinecap="round" />
    </svg>
  );
}

const navigation = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Gear" },
      { href: "/shop/belts", label: "Lever Belts" },
      { href: "/shop/wrist-straps", label: "Wrist Straps" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const socialLinks = [
  {
    href: "mailto:contact@forgegym.us",
    label: "Email FORGE support",
    icon: Mail,
  },
  {
    href: "https://www.instagram.com/forgexfit?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    label: "FORGE Instagram",
    icon: InstagramIcon,
  },
  {
    href: "https://www.tiktok.com/@forgexfit?is_from_webapp=1&sender_device=pc",
    label: "FORGE TikTok",
    icon: Music2,
  },
];

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-12 w-full border-y border-dotted border-red-600/25 bg-black px-2 text-white sm:mt-16 md:mt-20">
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)] md:px-8">
        <ForgeLogo
          className="mx-auto flex items-center justify-center rounded-full border border-dotted border-white/15 bg-white/[0.03] p-4 transition-colors hover:border-red-600/45 hover:bg-red-600/10 md:mx-0"
          markClassName="h-10 w-10"
        />
        <p className="max-w-4xl text-center text-sm leading-6 text-white/55 md:text-left">
          FORGE builds focused lifting gear for heavy training days: lever belts,
          wrist straps, and essentials made to feel locked-in, aggressive, and
          ready under load.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="border-b border-dotted border-white/15" />
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 md:flex md:justify-between">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-red-500">
                {section.title}
              </h3>
              <ul className="flex flex-col space-y-2" role="list">
                {section.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/55 transition-colors hover:text-white md:text-xs"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-b border-dotted border-white/15" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              aria-label={label}
              href={href}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              target={href.startsWith("http") ? "_blank" : undefined}
              className="rounded-xl border border-dotted border-white/18 bg-white/[0.03] p-3 text-white/75 transition-[border-color,color,transform,background-color] hover:-translate-y-1 hover:border-red-600/60 hover:bg-red-600/10 hover:text-white"
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          ))}

          <button
            type="button"
            onClick={handleScrollTop}
            className="flex items-center rounded-full border border-dotted border-white/18 bg-white/[0.03] px-4 py-3 text-white/75 transition-[border-color,color,transform,background-color] hover:-translate-y-1 hover:border-red-600/60 hover:bg-red-600/10 hover:text-white"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={1.8} />
            <span className="sr-only">Back to top</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-white/45 sm:flex-row">
          <span>© {year} Capacity Gears LLC</span>
          <span className="hidden text-white/20 sm:inline">-</span>
          <span className="flex items-center gap-1">
            Built with
            <Heart className="h-4 w-4 animate-pulse text-red-600" />
            for heavy training
          </span>
          <span className="hidden text-white/20 sm:inline">-</span>
          <span className="flex items-center gap-1 font-semibold text-white/70">
            <Dumbbell className="h-4 w-4 text-red-600" />
            Strength Built Different
          </span>
        </div>
      </div>
    </footer>
  );
}
