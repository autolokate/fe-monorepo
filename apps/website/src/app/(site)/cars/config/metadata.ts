import type { Metadata } from "next";

export const carsMetadata: Metadata = {
  title: "Explore cars by brand — Autolokate",
  description:
    "Browse every car maker in the Autolokate catalogue. Tap a brand to see all listings with full filters — price, fuel, body type, city, and more.",
  keywords:
    "car brands India, browse by brand, Maruti Hyundai Tata, car inventory by maker, Autolokate cars",
  alternates: { canonical: "/cars" },
  openGraph: {
    title: "Explore cars by brand — Autolokate",
    description:
      "Official manufacturer marks on a neutral canvas. Pick a brand to see Autolokate's filtered inventory.",
    url: "/cars",
    type: "website",
  },
};
