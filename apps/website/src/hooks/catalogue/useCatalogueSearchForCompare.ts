"use client";

import { useEffect, useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { searchCatalogueMixed } from "@/services/catalogue/catalogue-api";

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/**
 * Debounced catalogue search tuned for the compare picker (`/v1/catalogue/search`).
 */
export function useCatalogueSearchForCompare(searchQuery: string) {
  const debounced = useDebouncedValue(searchQuery.trim(), 320);
  const enabled = debounced.length >= 2;

  return useApiQuery(() => searchCatalogueMixed(debounced), [debounced], {
    enabled,
  });
}
