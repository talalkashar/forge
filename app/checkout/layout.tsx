import type { Metadata } from "next";

/** Checkout is transactional — noindex. */
export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your FORGE GYM order with secure on-site Stripe payment.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
