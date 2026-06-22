import type { VehicleCategory } from "@/lib/preferences";

export interface BrandsDirectoryCopy {
  eyebrow: string;
  /** Headline rendered as `Explore by <accent>` — the accent word is the brand. */
  headlinePrefix: string;
  headlineAccent: string;
  description: string;
  primaryCta: { label: string; href: string };
  searchPlaceholder: string;
  searchLabel: string;
  emptyTitle: string;
}

/**
 * Per-vehicle-type copy. Keeping it data-driven means the same directory
 * component renders for /cars, /bikes, and any future category we add
 * without forking the JSX. Brand cards link to `/{vehicleType}/{brandSlug}`
 * (e.g. `/cars/tata-motors`, `/bikes/bajaj`).
 */
export const BRANDS_DIRECTORY_COPY: Record<VehicleCategory, BrandsDirectoryCopy> = {
  cars: {
    eyebrow: "Marketplace · Cars",
    headlinePrefix: "Explore by",
    headlineAccent: "Brand",
    description:
      "Official manufacturer marks on a neutral canvas for maximum clarity. Select a brand to open filtered inventory — price, fuel, body type, city, and more.",
    primaryCta: { label: "Explore all cars", href: "/cars/explore" },
    searchPlaceholder: "Type to filter brands...",
    searchLabel: "Find a brand",
    emptyTitle: "No brands match",
  },
  bikes: {
    eyebrow: "Marketplace · Bikes",
    headlinePrefix: "Explore by",
    headlineAccent: "brand",
    description:
      "Official manufacturer marks on a neutral canvas for maximum clarity. Select a brand to open filtered inventory — engine, body style, city, and more.",
    primaryCta: { label: "Explore all bikes", href: "/bikes/explore" },
    searchPlaceholder: "Type to filter brands...",
    searchLabel: "Find a brand",
    emptyTitle: "No brands match",
  },
};

export const BRAND_BACKGROUND = {
  light: "/brand_bg_light.png",
  dark: "/brand_bg_dark.png",
} as const;
