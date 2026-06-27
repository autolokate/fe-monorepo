import { FileClock, Headphones, MapPinned, QrCode } from "lucide-react";
import { SAFETY_PACKS_SECTION_ID } from "../SafetyPacksSection/constants";
import type { HeroCopy, HeroFeature, TrendingModel } from "./types";

export const HERO_BANNER_IMAGE = "/images/new-design/newDesignHeroBg.png";

export const HERO_COPY: HeroCopy = {
  badge: "Automatic Crash Detection",
  headline: "Protection that starts",
  headlineAccent: "when every second matters",
  subheading:
    "Automatic crash detection, family alerts, live location sharing, QR backup, and vehicle records built for safer everyday driving.",
  primaryCta: { label: "Get Protected Now", href: `/#${SAFETY_PACKS_SECTION_ID}` },
  secondaryCta: { label: "See How It Works", href: "/how-qr-works" },
};

export const HERO_FEATURES: HeroFeature[] = [
  {
    title: "Safety",
    body: "QR ID & emergency identification.",
    Icon: QrCode,
  },
  {
    title: "Park Me",
    body: "Find your car anywhere.",
    Icon: MapPinned,
  },
  {
    title: "Service History",
    body: "Track & manage maintenance.",
    Icon: FileClock,
  },
  {
    title: "Vehicle Help",
    body: "Expert support on the go.",
    Icon: Headphones,
  },
];

/**
 * Static seed data until a real trending API lands. Brand SVGs from `public/brands`
 * stand in for hero images so the layout reads correctly without remote fetches.
 */
export const TRENDING_MODELS: TrendingModel[] = [
  {
    id: "honda-city",
    href: "/cars/honda-city",
    title: "Honda City",
    subtitle: "Sedan · Petrol",
    imageUrl: "/brands/honda.svg",
    imageAlt: "Honda City",
    priceLabel: "From ₹11.82 L",
  },
  {
    id: "hyundai-creta",
    href: "/cars/hyundai-creta",
    title: "Hyundai Creta",
    subtitle: "SUV · Petrol · Diesel",
    imageUrl: "/brands/hyundai.svg",
    imageAlt: "Hyundai Creta",
    priceLabel: "From ₹11.10 L",
  },
  {
    id: "tata-nexon",
    href: "/cars/tata-nexon",
    title: "Tata Nexon",
    subtitle: "SUV · Petrol · EV",
    imageUrl: "/brands/tata.svg",
    imageAlt: "Tata Nexon",
    priceLabel: "From ₹8.15 L",
  },
];
