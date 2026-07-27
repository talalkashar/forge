import type { Metadata } from "next";
import HomePage from "./components/home/HomePage";
import { buildPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: site.searchTitle,
  description: site.description,
  path: "/",
  absoluteTitle: true,
  ogImageAlt:
    "FORGE GYM lever belts and wrist straps for heavy squats and deadlifts",
  keywords: [...site.keywords],
});

export default function Home() {
  return <HomePage />;
}
