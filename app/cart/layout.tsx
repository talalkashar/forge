import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

/** Cart is transactional — noindex so it does not compete in search. */
export const metadata: Metadata = buildPageMetadata({
  title: "Cart",
  description:
    "Review your FORGE GYM order, update quantities, and proceed to secure on-site checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
