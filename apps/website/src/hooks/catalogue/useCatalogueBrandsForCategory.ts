'use client';

import { useMemo } from 'react';

import { fromApiVehicleCategory, type VehicleCategory } from '@/lib/preferences';
import { slugifyPart } from '@/lib/seo';

import { useBrands } from './useBrands';

export type CatalogueBrandOption = { name: string; slug: string };

/**
 * Loosely-typed brand row: the shared `CatalogueBrand` marks these fields as
 * always-present, but API rows can omit either the `brand_*` or the bare
 * variant — so treat them as optional at the use-site where we fall back.
 */
type LooseBrandRow = {
  brand_name?: string;
  name?: string;
  slug?: string;
  brand_slug?: string;
  vehicle_category?: string | null;
};

/**
 * Deduped brands sorted by name, optionally filtered by `vehicle_category` when
 * the API has classified entries (same rules as {@link BrandsDirectoryPage}).
 */
export function useCatalogueBrandsForCategory(
  vehicleType: VehicleCategory,
  opts: { enabled?: boolean } = {},
) {
  const { enabled = true } = opts;
  const { data: rawBrands, isLoading, isFetching, isError, refetch } = useBrands({ enabled });

  const brandOptions = useMemo<CatalogueBrandOption[]>(() => {
    const cards = (rawBrands ?? [])
      .map((brand) => {
        const row = brand as LooseBrandRow;
        const name = (row.brand_name ?? row.name ?? '').trim();
        const slug = (row.slug ?? row.brand_slug ?? slugifyPart(name)).trim();
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
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );

    const all = rawBrands ?? [];
    const anyClassified = all.some((b) => Boolean(b.vehicle_category));
    if (!anyClassified) return list;

    const allowedSlugs = new Set(
      all
        .filter((b) => fromApiVehicleCategory(b.vehicle_category) === vehicleType)
        .map((b) => {
          const row = b as LooseBrandRow;
          return (row.slug ?? row.brand_slug ?? slugifyPart(row.brand_name ?? row.name ?? ''))
            .trim()
            .toLowerCase();
        })
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
