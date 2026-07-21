import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description:
    "Review your FORGE GYM order, update quantities, and proceed to secure checkout.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
