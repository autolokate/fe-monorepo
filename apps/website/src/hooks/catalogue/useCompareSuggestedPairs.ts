"use client";

import { useMemo } from "react";

import { useApiQuery } from "@/hooks/useApiQuery";
import type { VehicleCategory } from "@/lib/preferences";
import {
  fetchCompareSuggestedEntries,
  groupCompareSuggestedPairs,
} from "@/lib/catalogue/compare-suggested-pairs";

/**
 * Trending-based suggested compare pairs (same source as legacy Autolokate compare page):
 * `GET /v1/catalogue/trending` plus per-model default variant resolution when needed.
 */
export function useCompareSuggestedPairs(vehicleCategory: VehicleCategory) {
  const query = useApiQuery(
    () => fetchCompareSuggestedEntries(vehicleCategory),
    [vehicleCategory],
  );

  const pairs = useMemo(
    () => groupCompareSuggestedPairs(query.data ?? []),
    [query.data],
  );

  return {
    ...query,
    pairs,
    entries: query.data ?? [],
  };
}
