"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CatalogueModel } from "@/lib/catalogue/types";
import { fromApiVehicleCategory, type VehicleCategory } from "@/lib/preferences";
import { getCatalogueModelsPage } from "@/services/catalogue";

import { primaryModelKey } from "@/components/catalogue/BrandModelsPage/model-utils";

function modelMatchesExplorerCategory(model: CatalogueModel, vt: VehicleCategory): boolean {
  const raw =
    typeof model.vehicle_category === "string"
      ? model.vehicle_category
      : typeof (model as Record<string, unknown>).vehicle_category === "string"
        ? String((model as Record<string, unknown>).vehicle_category)
        : null;
  const mapped = fromApiVehicleCategory(raw);
  if (mapped === null) return true;
  return mapped === vt;
}

/**
 * Paginated `/v1/catalogue/models` for `/{cars|bikes}/explore`, with client-side vehicle filter.
 */
export function useCatalogueExploreModels(vehicleType: VehicleCategory) {
  const [models, setModels] = useState<CatalogueModel[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const vehicleTypeRef = useRef(vehicleType);
  vehicleTypeRef.current = vehicleType;

  const fetchPage = useCallback(async (cursor: string | null, append: boolean) => {
    if (append) setIsFetchingMore(true);
    else {
      setIsLoading(true);
    }
    setIsError(false);
    try {
      const vt = vehicleTypeRef.current;
      const { models: pageModels, nextCursor: next } = await getCatalogueModelsPage({
        cursor: cursor ?? undefined,
      });
      const filtered = pageModels.filter((m) => modelMatchesExplorerCategory(m, vt));
      setModels((prev) => {
        if (!append) return filtered;
        const seen = new Set(prev.map(primaryModelKey));
        const additions = filtered.filter((m) => !seen.has(primaryModelKey(m)));
        return [...prev, ...additions];
      });
      setNextCursor(next);
    } catch {
      setIsError(true);
      if (!append) {
        setModels([]);
        setNextCursor(null);
      }
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    vehicleTypeRef.current = vehicleType;
    setModels([]);
    setNextCursor(null);
    setIsError(false);
    setIsLoading(true);
    void fetchPage(null, false);
  }, [vehicleType, fetchPage]);

  const loadMore = useCallback(() => {
    if (nextCursor != null && !isFetchingMore && !isLoading) void fetchPage(nextCursor, true);
  }, [fetchPage, nextCursor, isFetchingMore, isLoading]);

  const refetch = useCallback(() => {
    setModels([]);
    setNextCursor(null);
    void fetchPage(null, false);
  }, [fetchPage]);

  return {
    models,
    nextCursor,
    hasMore: nextCursor !== null,
    isLoading,
    isFetchingMore,
    isError,
    loadMore,
    refetch,
  };
}
