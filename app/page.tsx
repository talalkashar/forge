import type { Metadata } from "next";
import HomePage from "./components/home/HomePage";

export const metadata: Metadata = {
  title: "FORGE | Premium Strength Gear",
  description: "Premium lifting belts and wrist straps built for disciplined training and heavy sessions.",
};

export default function Home() {
  return <HomePage />;
}
