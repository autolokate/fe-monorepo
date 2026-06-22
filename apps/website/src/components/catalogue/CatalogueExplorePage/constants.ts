import type { VehicleCategory } from "@/lib/preferences";

/** Hero art for `/cars/explore` and `/bikes/explore` (theme variants in `public/images/`). */
export const EXPLORE_BANNER_BACKGROUND = {
  light: "/images/explore_banner_bg_light.png",
  dark: "/images/explore_banner_bg_dark.png",
} as const;

export const EXPLORE_CATALOGUE_COPY: Record<
  VehicleCategory,
  {
    badge: string;
    title: string;
    subtitle: string;
    directoryLinkLabel: string;
    modelsHeading: string;
    emptyCopy: string;
    loadMore: string;
  }
> = {
  cars: {
    badge: "Marketplace · Cars",
    title: "Explore every car model",
    subtitle:
      "Full catalogue feed from live inventory — filter by brand, body type, fuel, and sort by price.",
    directoryLinkLabel: "Browse by brand",
    modelsHeading: "All models",
    emptyCopy:
      "We couldn’t load models yet. Try again shortly or browse the brand directory.",
    loadMore: "Load more models",
  },
  bikes: {
    badge: "Marketplace · Bikes",
    title: "Explore every bike model",
    subtitle:
      "Full catalogue feed from live inventory — filter by brand, body type, fuel, and sort by price.",
    directoryLinkLabel: "Browse by brand",
    modelsHeading: "All models",
    emptyCopy:
      "We couldn’t load models yet. Try again shortly or browse the brand directory.",
    loadMore: "Load more models",
  },
};
