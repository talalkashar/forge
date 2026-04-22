"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.pageYOffset > 100);

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.classList.toggle("menu-open", isOpen);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-red-600/20 transition-all duration-300 ${
        isScrolled ? "shadow-lg" : ""
      }`}
      id="navbar"
    >
      <div className="w-full flex items-center justify-between px-4 py-3 h-16 sm:h-20">
        <div className="flex items-center flex-1">
          <button
            className={`md:hidden flex flex-col space-y-1.5 p-2 z-50 ${isOpen ? "active" : ""}`}
            id="mobile-menu-btn"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className="w-6 h-0.5 bg-white transition-all duration-300" id="line1" />
            <span className="w-6 h-0.5 bg-white transition-all duration-300" id="line2" />
            <span className="w-6 h-0.5 bg-white transition-all duration-300" id="line3" />
          </button>
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="nav-link text-sm lg:text-base">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center flex-1 justify-center">
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 group">
            <span className="forge-logo-text text-xl sm:text-2xl md:text-3xl tracking-wider">
              FORGE
            </span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full animate-pulse" />
          </Link>
        </div>

        <div className="flex items-center flex-1 justify-end h-full">
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

      <div
        className={`md:hidden w-full bg-black border-b border-red-600/20 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
        id="mobile-menu"
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link block py-2 text-lg"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
