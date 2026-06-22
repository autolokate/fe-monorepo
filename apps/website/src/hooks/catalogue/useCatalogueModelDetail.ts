"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import { fetchCatalogueModelDetailPayload } from "@/lib/catalogue/model-detail-payload";
import type { CatalogueModelDetailPayload } from "@/lib/catalogue/types";

/** Loads model + variants + grouped specs/features (Autolokate `LiveModelDetailLoader` parity). */
export function useCatalogueModelDetail(
  brandSlug: string | undefined,
  modelSlug: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const b = String(brandSlug ?? "").trim();
  const m = String(modelSlug ?? "").trim();
  const canRun = Boolean(enabled && b && m);

  return useApiQuery<CatalogueModelDetailPayload>(
    () => fetchCatalogueModelDetailPayload(b, m),
    [b, m, enabled],
    { enabled: canRun },
  );
}
