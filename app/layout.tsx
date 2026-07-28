import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/context/CartContext";
import PageEnter from "@/app/components/providers/PageEnter";
import SmoothScroll from "@/app/components/providers/SmoothScroll";
import { FixedPortalProvider } from "@/app/components/providers/FixedPortal";
import JsonLd from "@/app/components/site/JsonLd";
import { site } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.searchTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.shortName,
  keywords: [...site.keywords],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.legalName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: site.searchTitle,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: site.ogImage,
        width: 1600,
        height: 1600,
        alt: "FORGE GYM lever belts and wrist straps for heavy training",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.searchTitle,
    description: site.description,
    images: [site.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  /**
   * Google Search Console ownership.
   * Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel when you add the HTML tag method.
   */
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
  category: "shopping",
};

const orgAndSiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      legalName: site.legalName,
      alternateName: ["FORGE", "FORGE Gym", "forge gym", "Forge Sports", "forgegym"],
      url: site.url,
      description: site.description,
      email: site.email,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}${site.ogImage}`,
      },
      image: site.productImages.map((src) => `${site.url}${src}`),
      brand: {
        "@type": "Brand",
        name: site.name,
      },
      sameAs: [site.instagram, site.tiktokShop],
      contactPoint: {
        "@type": "ContactPoint",
        email: site.email,
        contactType: "customer service",
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      publisher: { "@id": `${site.url}/#organization` },
      inLanguage: "en-US",
    },
  ],
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
      <head>
        {/* Warm hero encodes early — correct file per viewport */}
        <link
          rel="preload"
          as="video"
          href="/videos/hero/forge-hero-berserk-mobile.mp4?v=20260722c"
          type="video/mp4"
          media="(max-width: 1024px)"
        />
        <link
          rel="preload"
          as="video"
          href="/videos/hero/forge-hero-berserk.mp4?v=20260722c"
          type="video/mp4"
          media="(min-width: 1025px)"
        />
      </head>
      <body className="flex min-h-full flex-col bg-black text-white">
        <JsonLd data={orgAndSiteJsonLd} />
        <CartProvider>
          {/* Fixed UI (nav, modals, sticky cart) portals here , outside ScrollSmoother content */}
          <div
            id="forge-fixed-layer"
            className="pointer-events-none fixed inset-0 z-[200]"
          />
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
