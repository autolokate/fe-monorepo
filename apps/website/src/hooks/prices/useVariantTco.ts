"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import type { TcoBreakdown } from "@/services/prices/prices-api";
import { getTco } from "@/services/prices/prices-api";

export function useVariantTco(
  variantId: string | undefined,
  city: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const id = String(variantId ?? "").trim();
  const c = String(city ?? "").trim();
  const canRun = Boolean(enabled && id && c);

  return useApiQuery<TcoBreakdown>(() => getTco(id, c), [id, c, enabled], {
    enabled: canRun,
  });
}
