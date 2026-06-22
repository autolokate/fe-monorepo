"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import { getBrands } from "@/services/catalogue";

/** Reactive list of catalogue brands. Public endpoint — no auth required. */
export function useBrands(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  return useApiQuery(() => getBrands(), [enabled], {
    enabled,
    initialData: [],
  });
}
