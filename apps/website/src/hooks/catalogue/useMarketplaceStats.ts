"use client";

import { useMemo } from "react";
import { dedupeBrandNames } from "@/lib/catalogue/normalize";
import { useBrands } from "./useBrands";

/**
 * Headline marketplace counts. Mirrors Autolokate's `useMarketplaceStats`:
 *  - **Brands**: live from `/v1/catalogue/brands` when available; otherwise
 *    falls back to the bundled inventory brand count.
 *  - **Listings + Cities**: pure static — these come from the same bundled
 *    inventory dataset in Autolokate, so we ship matching constants here
 *    until a dedicated listings endpoint exists.
 *
 * Numbers below come from counting `Autolokate/src/data/json/cars.json`:
 *  - 20 brands, 1,429 listings, 12 cities.
 */
const INVENTORY_BRAND_COUNT = 20;
const INVENTORY_LISTING_COUNT = 1429;
const INVENTORY_CITY_COUNT = 12;

export function useMarketplaceStats() {
  const { data, isError } = useBrands();

  const brandCount = useMemo(() => {
    if (!data || isError) return INVENTORY_BRAND_COUNT;
    const names = dedupeBrandNames(data);
    return names.length > 0 ? names.length : INVENTORY_BRAND_COUNT;
  }, [data, isError]);

  return {
    brandCount,
    listingCount: INVENTORY_LISTING_COUNT,
    cityCount: INVENTORY_CITY_COUNT,
  };
}
