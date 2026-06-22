"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import type { TaxonomyBundle } from "@/services/taxonomy/taxonomy-api";
import { getTaxonomy } from "@/services/taxonomy/taxonomy-api";

export function useCatalogueTaxonomy(
  category: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const c = String(category ?? "").trim();
  const canRun = Boolean(enabled && c);

  return useApiQuery<TaxonomyBundle>(() => getTaxonomy({ category: c }), [c, enabled], {
    enabled: canRun,
  });
}
