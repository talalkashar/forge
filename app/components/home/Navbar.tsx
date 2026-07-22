"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FixedPortal } from "@/app/components/providers/FixedPortal";
import { useCart } from "@/context/CartContext";
import ProductSearchModal from "../product/ProductSearchModal";
import ForgeLogo from "./ForgeLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop/belts", label: "Lever Belts" },
  { href: "/shop/wrist-straps", label: "Wrist Straps" },
  { href: "/shop", label: "All Gear" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { cartCount } = useCart();

  useEffect(() => {
    let frame = 0;

    const syncScrolledState = () => {
      frame = 0;
      const nextScrolled = window.scrollY > 24;
      setIsScrolled((current) =>
        current === nextScrolled ? current : nextScrolled,
      );
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(syncScrolledState);
    };

    syncScrolledState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openSearch = () => {
    setIsOpen(false);
    setIsSearchOpen(true);
  };

  return (
    <FixedPortal>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
          isScrolled || isOpen
            ? "border-white/10 bg-black/90 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md"
            : "border-transparent bg-transparent shadow-none"
        }`}
        id="navbar"
      >
        {/* Soft top read scrim on mobile when nav is clear over hero video */}
        {!isScrolled && !isOpen ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 via-black/20 to-transparent sm:h-28 sm:from-black/40"
            aria-hidden="true"
          />
        ) : null}
        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 py-3 sm:h-20 sm:px-6">
          <div className="flex flex-1 items-center">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center gap-2 px-2 py-2 text-[0.7rem] font-black uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 [text-shadow:0_1px_10px_rgba(0,0,0,0.75)] lg:hidden"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((current) => !current)}
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
              <span>Menu</span>
            </button>

            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.slice(1, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 [text-shadow:0_1px_10px_rgba(0,0,0,0.65)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)]">
            <ForgeLogo markClassName="text-[1.35rem] sm:text-[1.55rem] md:text-[1.7rem]" />
          </div>

          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
            <div className="mr-1 hidden items-center gap-1 lg:flex">
              <Link
                href="/about"
                className="px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 [text-shadow:0_1px_10px_rgba(0,0,0,0.65)]"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 [text-shadow:0_1px_10px_rgba(0,0,0,0.65)]"
              >
                Contact
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-white transition-opacity hover:opacity-80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
              aria-label="Search products"
              onClick={openSearch}
            >
              <Search className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
            <Link
              href="/cart"
              className="relative inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-white transition-opacity hover:opacity-80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center bg-red-600 px-1 text-[0.65rem] font-black text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-40 bg-black lg:hidden"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex h-full flex-col px-6 pb-10 pt-24">
              <p className="mb-8 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-red-500">
                FORGE GYM™
              </p>
              <nav className="flex flex-1 flex-col gap-1" aria-label="Mobile">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, x: -16 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="block border-b border-white/[0.06] py-4 text-2xl font-black tracking-tight text-white transition-colors hover:text-red-400"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <button
                type="button"
                onClick={openSearch}
                className="mt-6 w-full border border-white/15 py-4 text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                Search gear
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ProductSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </FixedPortal>
  );
}
