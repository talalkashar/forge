import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Paused",
  description:
    "Your FORGE GYM checkout was cancelled and your cart is still available.",
};

export default function CancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
