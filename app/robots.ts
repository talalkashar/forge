import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Dynamic robots.txt — allow storefront crawl; block admin, APIs,
 * and transactional pages that should not rank.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/cart",
          "/success",
          "/cancel",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/cart",
          "/success",
          "/cancel",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
