import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_URL || "https://forgegym.us";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/shop",
    "/shop/belts",
    "/shop/wrist-straps",
    "/product/belt",
    "/product/straps",
    "/about",
    "/contact",
    "/faq",
    "/shipping",
    "/returns",
    "/privacy",
    "/cart",
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/product") || path.startsWith("/shop")
      ? "weekly"
      : "monthly",
    priority: path === "" ? 1 : path.startsWith("/shop") || path.startsWith("/product") ? 0.9 : 0.5,
  }));
}
