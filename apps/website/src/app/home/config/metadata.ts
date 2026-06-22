import type { Metadata } from "next";

export const homeMetadata: Metadata = {
  title: "Autolokate – AI Car Discovery Platform",
  description:
    "Find the right car with confidence. Compare models, explore variants, and get smart recommendations based on your budget, fuel type, and lifestyle.",
  keywords: [
    "Autolokate",
    "AI car discovery",
    "car comparison India",
    "car recommendation engine",
    "expert consultation",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Autolokate – AI Car Discovery Platform",
    description:
      "Find the right car with AI prompts, rich detail pages, side-by-side comparison, and expert consultations.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autolokate – AI Car Discovery Platform",
    description:
      "AI-first car discovery and compare experience built for confident buying decisions.",
  },
};
