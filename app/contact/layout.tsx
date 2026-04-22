import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | FORGE",
  description: "Contact FORGE for product questions, order support, and training gear inquiries.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
