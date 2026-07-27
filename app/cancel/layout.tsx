import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

/** Checkout cancel — transactional, noindex. */
export const metadata: Metadata = buildPageMetadata({
  title: "Checkout Paused",
  description:
    "Your FORGE GYM checkout was cancelled and your cart is still available.",
  path: "/cancel",
  noIndex: true,
});

export default function CancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
