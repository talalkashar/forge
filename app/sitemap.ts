import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Programmatic sitemap — regenerates on each production deploy/build.
 * Add new public indexable routes here so Google discovers them.
 * Do not list cart, checkout success/cancel, or admin.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const productImages = site.productImages.map((src) => absoluteUrl(src));

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    images?: string[];
  }> = [
    {
      path: "/",
      changeFrequency: "weekly",
      priority: 1,
      images: productImages.slice(0, 10),
    },
    { path: "/shop", changeFrequency: "weekly", priority: 0.95 },
    {
      path: "/shop/belts",
      changeFrequency: "weekly",
      priority: 0.9,
      images: productImages.slice(0, 3),
    },
    {
      path: "/shop/wrist-straps",
      changeFrequency: "weekly",
      priority: 0.9,
      images: [absoluteUrl(site.productImages[3] ?? site.ogImage)],
    },
    {
      path: "/product/belt",
      changeFrequency: "weekly",
      priority: 0.95,
      images: productImages.slice(0, 3),
    },
    {
      path: "/product/straps",
      changeFrequency: "weekly",
      priority: 0.9,
      images: [absoluteUrl(site.productImages[3] ?? site.ogImage)],
    },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.55 },
    { path: "/shipping", changeFrequency: "monthly", priority: 0.4 },
    { path: "/returns", changeFrequency: "monthly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.images?.length ? { images: route.images } : {}),
  }));
}
