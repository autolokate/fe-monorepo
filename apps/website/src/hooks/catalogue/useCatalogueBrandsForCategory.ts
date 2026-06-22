"use client";

import { useMemo } from "react";

import type { CatalogueBrand } from "@/lib/catalogue/types";
import { fromApiVehicleCategory, type VehicleCategory } from "@/lib/preferences";
import { slugifyPart } from "@/lib/seo";

import { useBrands } from "./useBrands";

export type CatalogueBrandOption = { name: string; slug: string };

/**
 * Deduped brands sorted by name, optionally filtered by `vehicle_category` when
 * the API has classified entries (same rules as {@link BrandsDirectoryPage}).
 */
export function useCatalogueBrandsForCategory(
  vehicleType: VehicleCategory,
  opts: { enabled?: boolean } = {},
) {
  const { enabled = true } = opts;
  const {
    data: rawBrands,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useBrands({ enabled });

  const brandOptions = useMemo<CatalogueBrandOption[]>(() => {
    const cards = (rawBrands ?? [])
      .map((brand) => {
        const row = brand as CatalogueBrand;
        const name = String(row.brand_name ?? row.name ?? "").trim();
        const slug = String(row.slug ?? row.brand_slug ?? slugifyPart(name)).trim();
        if (!name || !slug) return null;
        return { name, slug };
      })
      .filter((row): row is CatalogueBrandOption => Boolean(row));

    const deduped = new Map<string, CatalogueBrandOption>();
    for (const card of cards) {
      const key = card.slug.toLowerCase();
      if (!deduped.has(key)) deduped.set(key, card);
    }
    const list = [...deduped.values()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    const all = rawBrands ?? [];
    const anyClassified = all.some((b) =>
      Boolean((b as CatalogueBrand).vehicle_category),
    );
    if (!anyClassified) return list;

    const allowedSlugs = new Set(
      all
        .filter(
          (b) => fromApiVehicleCategory((b as CatalogueBrand).vehicle_category) === vehicleType,
        )
        .map((b) =>
          String(
            (b as CatalogueBrand).slug ??
              (b as CatalogueBrand).brand_slug ??
              slugifyPart(String((b as CatalogueBrand).brand_name ?? (b as CatalogueBrand).name ?? "")),
          )
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    );
    return list.filter((b) => allowedSlugs.has(b.slug.toLowerCase()));
  }, [rawBrands, vehicleType]);

  return {
    brandOptions,
    brandCount: brandOptions.length,
    isLoading,
    isFetching,
    isError,
    refetch,
    rawBrands,
  };
}
