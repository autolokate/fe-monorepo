"use client";

import type { CatalogueModel } from "@/lib/catalogue/types";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getBrandModels } from "@/services/catalogue";

/** Model line-up for a manufacturer from `GET /v1/catalogue/brands/{slug}/models`. */
export function useBrandModels(
  brandSlug: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const slug = String(brandSlug ?? "").trim();
  const canRun = Boolean(enabled && slug);

  return useApiQuery<CatalogueModel[]>(() => getBrandModels(slug), [slug, enabled], {
    enabled: canRun,
  });
}
