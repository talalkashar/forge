import type { Metadata } from "next";
import HomePage from "./components/home/HomePage";

export const metadata: Metadata = {
  title: { absolute: "FORGE GYM | Premium Strength Gear" },
  description:
    "FORGE GYM lever belts and wrist straps built for disciplined training and heavy sessions.",
};

export default function Home() {
  return <HomePage />;
}
