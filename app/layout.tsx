import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import PageEnter from "@/app/components/providers/PageEnter";
import SmoothScroll from "@/app/components/providers/SmoothScroll";
import { FixedPortalProvider } from "@/app/components/providers/FixedPortal";
import JsonLd from "@/app/components/site/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://forgegym.us",
  ),
  title: {
    default: "FORGE GYM | Premium Strength Gear",
    template: "%s | FORGE GYM",
  },
  description:
    "FORGE GYM premium 10mm lever belts and wrist straps built for heavy training. Secure Stripe checkout.",
  openGraph: {
    title: "FORGE GYM | Premium Strength Gear",
    description:
      "Lever belts and wrist straps for heavy work. Built different.",
    type: "website",
    siteName: "FORGE GYM",
    images: [
      {
        url: "/images/og/forge-og.jpg",
        width: 1200,
        height: 1200,
        alt: "FORGE GYM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE GYM",
    description: "Premium lever belts and wrist straps for heavy training.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FORGE GYM",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://forgegym.us",
  description:
    "Premium lever belts and wrist straps built for heavy training.",
  brand: { "@type": "Brand", name: "FORGE GYM" },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col bg-black text-white">
        <JsonLd data={orgJsonLd} />
        <CartProvider>
          {/* Fixed UI (nav, modals, sticky cart) portals here , outside ScrollSmoother content */}
          <div id="forge-fixed-layer" className="pointer-events-none fixed inset-0 z-[200]" />
          <FixedPortalProvider>
            <SmoothScroll>
              <PageEnter>{children}</PageEnter>
            </SmoothScroll>
          </FixedPortalProvider>
        </CartProvider>
      </body>
    </html>
  );
}
