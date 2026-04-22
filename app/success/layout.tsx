import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful | FORGE",
  description: "Your FORGE checkout is complete.",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
