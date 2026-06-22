"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import { getTrendingModels } from "@/services/catalogue";

/** Reactive list of trending catalogue models. Public endpoint. */
export function useTrendingModels(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  return useApiQuery(() => getTrendingModels(), [enabled], {
    enabled,
    initialData: [],
  });
}
