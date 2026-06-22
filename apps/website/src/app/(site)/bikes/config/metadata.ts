import type { Metadata } from "next";

export const bikesMetadata: Metadata = {
  title: "Explore bikes by brand — Autolokate",
  description:
    "Browse every two-wheeler maker in the Autolokate catalogue. Tap a brand to see all listings with full filters — price, engine, city, and more.",
  keywords:
    "bike brands India, two wheeler brands, Royal Enfield Bajaj TVS, motorcycle inventory by maker, Autolokate bikes",
  alternates: { canonical: "/bikes" },
  openGraph: {
    title: "Explore bikes by brand — Autolokate",
    description:
      "Official manufacturer marks on a neutral canvas. Pick a brand to see Autolokate's filtered two-wheeler inventory.",
    url: "/bikes",
    type: "website",
  },
};
