import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

/** Payment confirmation — must not be indexed or listed in sitemaps. */
export const metadata: Metadata = buildPageMetadata({
  title: "Order Confirmed",
  description: "Your FORGE GYM checkout is complete.",
  path: "/success",
  noIndex: true,
});

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
