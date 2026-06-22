"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import { compareVariantsList } from "@/services/catalogue/catalogue-api";

/**
 * Loads normalised variant rows for the catalogue compare API.
 * Runs only when there are at least two variant IDs (backend requirement).
 */
export function useCatalogueCompare(variantIds: string[]) {
  const cleaned = variantIds.map((id) => id.trim()).filter(Boolean).slice(0, 3);
  const depsKey = cleaned.slice().sort().join("|");

  return useApiQuery(() => compareVariantsList(cleaned), [depsKey], {
    enabled: cleaned.length >= 2,
  });
}
