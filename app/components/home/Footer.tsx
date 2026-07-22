"use client";

import Link from "next/link";
import { ArrowUp, Mail, Music2 } from "lucide-react";

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
    href: "https://www.instagram.com/forgegym.us/",
    label: "FORGE Instagram",
    icon: InstagramIcon,
  },
  {
    href: "https://shop.tiktok.com/us/store/forgesports/7496252332747098142",
    label: "FORGE TikTok Shop",
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
    <footer className="mt-0 w-full border-t border-white/[0.08] bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/35">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2.5" role="list">
                {section.links.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/35">
              Connect
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  aria-label={label}
                  href={href}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  className="rounded-full border border-white/12 bg-white/[0.03] p-3 text-white/70 transition-[border-color,color,background-color,transform] hover:-translate-y-0.5 hover:border-red-600/50 hover:bg-red-600/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {year} Capacity Gears LLC · forgegym.us
          </p>
          <button
            type="button"
            onClick={handleScrollTop}
            className="inline-flex w-fit items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </footer>
  );
}
