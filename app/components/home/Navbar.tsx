"use client";

import Link from "next/link";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    let frame = 0;

    const syncScrolledState = () => {
      frame = 0;
      const nextScrolled = window.scrollY > 24;
      setIsScrolled((current) => (current === nextScrolled ? current : nextScrolled));
    };

    const handleScroll = () => {
      if (frame) {
        return;
      }

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
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
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
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b border-red-600/16 bg-black/88 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${
          isScrolled ? "shadow-[0_12px_32px_rgba(0,0,0,0.28)]" : ""
        }`}
        id="navbar"
      >
        <div className="w-full flex items-center justify-between px-4 py-3 h-16 sm:h-20">
          <div className="relative flex flex-1 items-center" ref={menuRef}>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black uppercase tracking-[0.08em] text-white transition-[background-color,border-color,color] duration-200 hover:border-red-500/50 hover:bg-red-600/10 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 sm:px-4"
              aria-label="Open site sections"
              aria-expanded={isOpen}
              aria-controls="site-sections-menu"
              aria-haspopup="menu"
              onClick={() => setIsOpen((current) => !current)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              className={`absolute left-0 top-[calc(100%+0.75rem)] z-50 w-64 rounded-md border border-white/10 bg-black/95 p-2 shadow-[0_22px_60px_rgba(0,0,0,0.48)] backdrop-blur-md transition-[opacity,transform,visibility] duration-200 sm:w-72 ${
                isOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }`}
              id="site-sections-menu"
              role="menu"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="nav-link flex min-h-11 items-center rounded-sm px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]"
                  onClick={closeMenu}
                  role="menuitem"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center flex-1 justify-center">
            <ForgeLogo
              variant="mark"
              markClassName="h-8 sm:h-10 md:h-11"
            />
          </div>

          <div className="flex items-center flex-1 justify-end gap-1 h-full">
            <button
              type="button"
              className="rounded-full p-2 text-white transition-[background-color,color] duration-200 hover:bg-red-600/10 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
              aria-label="Search products"
              onClick={openSearch}
            >
              <Search className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
            <Link href="/cart" className="cart-btn relative p-2 text-white" aria-label="Shopping cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span
                className={`absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center cart-count ${
                  cartCount === 0 ? "hidden" : ""
                }`}
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

      </nav>
      <ProductSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
