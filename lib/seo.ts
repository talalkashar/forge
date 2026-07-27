import type { Metadata } from "next";
import { absoluteUrl, site } from "@/lib/site";

type PageSeoInput = {
  title: string;
  description: string;
  /** Path only, e.g. `/shop` or `/product/belt` */
  path: string;
  /** Use absolute title (skip `%s | FORGE GYM` template) */
  absoluteTitle?: boolean;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  keywords?: string[];
};

/**
 * Shared page metadata — same pattern as Lily's per-route exports:
 * unique title + description, canonical, Open Graph, Twitter.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  ogImage = site.ogImage,
  ogImageAlt = site.name,
  noIndex = false,
  keywords,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : title;

  return {
    title: absoluteTitle ? { absolute: fullTitle } : fullTitle,
    description,
    ...(keywords?.length ? { keywords: [...keywords] } : {}),
    alternates: {
      canonical: path.startsWith("/") ? path : `/${path}`,
    },
    openGraph: {
      title: absoluteTitle ? fullTitle : `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1600,
          height: 1600,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? fullTitle : `${title} | ${site.name}`,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : {
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
  };
}
