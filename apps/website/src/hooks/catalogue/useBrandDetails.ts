"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import { getBrandDetails } from "@/services/catalogue";
import type { CatalogueBrand } from "@/lib/catalogue/types";

/**
 * Single brand envelope from `GET /v1/catalogue/brands/{slug}`.
 * Resolves `null` when the slug is unknown (HTTP errors are swallowed).
 */
export function useBrandDetails(
  brandSlug: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const slug = String(brandSlug ?? "").trim();
  const canRun = Boolean(enabled && slug);

  return useApiQuery<CatalogueBrand | null>(() => getBrandDetails(slug), [slug, enabled], {
    enabled: canRun,
  });
}
