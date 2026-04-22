import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Products | FORGE",
  description: "Explore the full FORGE product lineup.",
};

export default function ProductPage() {
  redirect("/shop");
}
