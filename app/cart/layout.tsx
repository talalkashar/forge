import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart | FORGE",
  description: "Review your FORGE order, update quantities, and proceed to secure checkout.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
