import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lever Belt | FORGE",
  description: "Shop the FORGE lever belt line with Zeus, Berserk, and Black variants.",
};

export default function BeltLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
