'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageFade } from '@/components/shared/PageFade';
import { CompareSlots } from '@/components/compare/CompareSlots';
import { CompareWorkspace } from '@/components/compare/CompareWorkspace';
import { CompareSuggestedPairs } from '@/components/compare/CompareSuggestedPairs';
import { CompareAddDialog } from '@/components/compare/CompareAddDialog';
import { CompareTrayControls } from '@/components/compare/CompareTrayControls';
import { COMPARE_MAX_SLOTS } from '@/components/compare/constants';
import type { CompareTabId } from '@/lib/catalogue/compare-matrix';
import {
  comparePathWithModelSegments,
  compareRootPath,
  parseCompareIdsParam,
  parseCompareModelParam,
  serializeCompareModelSegments,
  type CompareModelSegment,
} from '@/lib/catalogue/compare-url';
import {
  compareSegmentFromVariant,
  resolveBrandModelToVariantId,
} from '@/lib/catalogue/resolve-default-variant';
import { useCatalogueCompare, useCatalogueTaxonomy } from '@/hooks/catalogue';
import type { CatalogueModel, CatalogueVariant } from '@/lib/catalogue/types';
import { toApiVehicleCategory, type VehicleCategory } from '@/lib/preferences';
import { cn } from '@/lib/utils';
import { getModelDetails } from '@/services/catalogue/catalogue-api';

function dedupePreserveOrder(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const t = id.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function segmentsForUrlFromState(
  variantIds: string[],
  variantsById: Map<string, CatalogueVariant>,
  segmentByVariantId: Record<string, CompareModelSegment>,
): CompareModelSegment[] | null {
  const out: CompareModelSegment[] = [];
  for (const id of variantIds) {
    const v = variantsById.get(id);
    const b = String(v?.brand_slug ?? '').trim();
    const m = String(v?.model_slug ?? '').trim();
    if (b && m) {
      out.push({ brandSlug: b, modelSlug: m });
      continue;
    }
    const cached = segmentByVariantId[id];
    if (cached?.brandSlug && cached?.modelSlug) {
      out.push(cached);
      continue;
    }
    return null;
  }
  return out;
}

export type ComparePageContentProps = {
  vehicleCategory: VehicleCategory;
};

export function ComparePageContent({ vehicleCategory }: ComparePageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelQ = searchParams.get('model') ?? '';
  const idsQ = searchParams.get('ids') ?? '';

  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [segmentByVariantId, setSegmentByVariantId] = useState<Record<string, CompareModelSegment>>(
    {},
  );
  const [resolvingUrl, setResolvingUrl] = useState(false);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);

  const skipNextUrlSyncRef = useRef(false);
  /** After our own `router.replace` updates `?model=`, skip re-resolving every segment (duplicate variants API). */
  const skipModelResolutionFromUrlSyncRef = useRef(false);

  const [modelDetailByVariantId, setModelDetailByVariantId] = useState<
    Partial<Record<string, CatalogueModel>>
  >({});

  // Resolve `?model=` (or legacy `?ids=`) into variant UUIDs used by the compare API.
  useEffect(() => {
    let cancelled = false;
    skipNextUrlSyncRef.current = true;

    (async () => {
      if (modelQ.trim()) {
        if (skipModelResolutionFromUrlSyncRef.current) {
          skipModelResolutionFromUrlSyncRef.current = false;
          setHydratedFromUrl(true);
          setResolvingUrl(false);
          return;
        }

        setHydratedFromUrl(false);
        setResolvingUrl(true);
        const segments = parseCompareModelParam(modelQ);
        if (!segments.length) {
          if (!cancelled) {
            setVariantIds([]);
            setSegmentByVariantId({});
            setResolvingUrl(false);
            setHydratedFromUrl(true);
          }
          return;
        }

        const zipped: { id: string; seg: CompareModelSegment }[] = [];
        for (const seg of segments) {
          const id = await resolveBrandModelToVariantId(seg.brandSlug, seg.modelSlug);
          if (id) zipped.push({ id, seg });
        }
        const ids = dedupePreserveOrder(zipped.map((z) => z.id)).slice(0, COMPARE_MAX_SLOTS);
        const map: Record<string, CompareModelSegment> = {};
        for (const z of zipped) {
          if (ids.includes(z.id)) map[z.id] = z.seg;
        }

        if (!cancelled) {
          setVariantIds(ids);
          setSegmentByVariantId(map);
          setResolvingUrl(false);
          setHydratedFromUrl(true);
        }
        return;
      }

      if (idsQ.trim()) {
        const ids = dedupePreserveOrder(parseCompareIdsParam(idsQ)).slice(0, COMPARE_MAX_SLOTS);
        if (!cancelled) {
          setVariantIds(ids);
          setSegmentByVariantId({});
          setResolvingUrl(false);
          setHydratedFromUrl(true);
        }
        return;
      }

      if (!cancelled) {
        setVariantIds([]);
        setSegmentByVariantId({});
        setResolvingUrl(false);
        setHydratedFromUrl(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [modelQ, idsQ]);

  const taxonomyCategory = toApiVehicleCategory(vehicleCategory);
  const taxonomyQuery = useCatalogueTaxonomy(taxonomyCategory);
  const compareQuery = useCatalogueCompare(variantIds);

  const variantsById = useMemo(() => {
    const m = new Map<string, CatalogueVariant>();
    for (const v of compareQuery.data ?? []) {
      const id = String(v.id ?? '').trim();
      if (id) m.set(id, v);
    }
    return m;
  }, [compareQuery.data]);

  useEffect(() => {
    if (!compareQuery.data?.length) return;
    setSegmentByVariantId((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const v of compareQuery.data!) {
        const id = String(v.id ?? '').trim();
        const seg = compareSegmentFromVariant(v);
        if (!id || !seg || next[id]) continue;
        next[id] = seg;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [compareQuery.data]);

  useEffect(() => {
    setModelDetailByVariantId((prev) => {
      const next: Partial<Record<string, CatalogueModel>> = {};
      for (const id of variantIds) {
        const row = prev[id];
        if (row) next[id] = row;
      }
      if (
        Object.keys(prev).length === Object.keys(next).length &&
        variantIds.every((id) => prev[id] === next[id])
      ) {
        return prev;
      }
      return next;
    });
  }, [variantIds]);

  /** Load `GET …/brands/{brand}/models/{model}` for each tray slot once slugs are known (enriched card UX). */
  useEffect(() => {
    let cancelled = false;

    async function hydrateModelRows() {
      await Promise.all(
        variantIds.map(async (id) => {
          const v = variantsById.get(id);
          const seg = segmentByVariantId[id] ?? (v ? compareSegmentFromVariant(v) : undefined);
          const b = seg?.brandSlug?.trim();
          const modelSlug = seg?.modelSlug?.trim();
          if (!b || !modelSlug) return;

          try {
            const row = await getModelDetails(b, modelSlug);
            if (cancelled || !row) return;
            if (!variantIds.includes(id)) return;
            setModelDetailByVariantId((prev) => {
              if (prev[id]) return prev;
              return { ...prev, [id]: row };
            });
          } catch {
            /* noop */
          }
        }),
      );
    }

    void hydrateModelRows();
    return () => {
      cancelled = true;
    };
  }, [variantIds, segmentByVariantId, variantsById]);

  useEffect(() => {
    if (!hydratedFromUrl || resolvingUrl) return;
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }

    const curModel = modelQ.trim();
    const curIds = idsQ.trim();

    if (variantIds.length === 0) {
      if (curModel || curIds) router.replace(compareRootPath(vehicleCategory), { scroll: false });
      return;
    }

    const segments = segmentsForUrlFromState(variantIds, variantsById, segmentByVariantId);
    if (!segments || segments.length !== variantIds.length) return;

    const serialized = serializeCompareModelSegments(segments);
    if (serialized === curModel && !curIds) return;

    skipModelResolutionFromUrlSyncRef.current = true;
    router.replace(comparePathWithModelSegments(segments, vehicleCategory), { scroll: false });
  }, [
    hydratedFromUrl,
    resolvingUrl,
    variantIds,
    variantsById,
    segmentByVariantId,
    router,
    modelQ,
    idsQ,
    compareQuery.data,
    vehicleCategory,
  ]);

  const orderedVariants = useMemo(() => {
    return variantIds.map((id) => variantsById.get(id)).filter(Boolean) as CatalogueVariant[];
  }, [variantIds, variantsById]);

  const bestValueId = useMemo(() => {
    if (orderedVariants.length < 2) return null;
    let best: { id: string; price: number } | null = null;
    for (const v of orderedVariants) {
      const id = String(v.id ?? '').trim();
      const p = Number(v.ex_showroom_price ?? v.min_price ?? NaN);
      if (!id || !Number.isFinite(p)) continue;
      if (!best || p < best.price) best = { id, price: p };
    }
    return best?.id ?? null;
  }, [orderedVariants]);

  const removeVariant = (variantId: string) => {
    setVariantIds((prev) => prev.filter((x) => x !== variantId));
    setSegmentByVariantId((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  };

  const clearTray = useCallback(() => {
    setVariantIds([]);
    setSegmentByVariantId({});
    setModelDetailByVariantId({});
    skipNextUrlSyncRef.current = true;
    router.replace(compareRootPath(vehicleCategory), { scroll: false });
  }, [router, vehicleCategory]);

  const addVariant = (variantId: string, meta?: CompareModelSegment) => {
    const v = variantId.trim();
    if (!v) return;
    setVariantIds((prev) => {
      const withoutDup = prev.filter((x) => x !== v);
      if (withoutDup.length >= COMPARE_MAX_SLOTS) return prev;
      return [...withoutDup, v].slice(0, COMPARE_MAX_SLOTS);
    });
    if (meta?.brandSlug && meta?.modelSlug) {
      setSegmentByVariantId((prev) => ({ ...prev, [v]: meta }));
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState<CompareTabId>('overview');

  const errMsg = compareQuery.error instanceof Error ? compareQuery.error.message : undefined;

  return (
    <PageFade>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p
          className={cn(
            'mb-6 text-center text-sm text-muted-foreground',
            !resolvingUrl && 'hidden',
          )}
          aria-live="polite"
        >
          Resolving models from your link…
        </p>
        <div className="mb-6 flex w-full justify-end">
          <CompareTrayControls selectedCount={variantIds.length} onClearTray={clearTray} />
        </div>
        <CompareSuggestedPairs vehicleCategory={vehicleCategory} />
        <CompareSlots
          ids={variantIds}
          variantsById={variantsById}
          modelDetailByVariantId={modelDetailByVariantId}
          bestValueId={bestValueId}
          onRemove={removeVariant}
          onRequestAdd={() => setDialogOpen(true)}
        />
        <CompareWorkspace
          tab={tab}
          onTabChange={setTab}
          taxonomy={taxonomyQuery.data}
          orderedVariants={orderedVariants}
          ids={variantIds}
          modelDetailByVariantId={modelDetailByVariantId}
          isLoading={compareQuery.isLoading || resolvingUrl}
          isError={compareQuery.isError}
          errorMessage={errMsg}
          onAddCar={() => setDialogOpen(true)}
        />
      </div>

      <CompareAddDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        excludeIds={variantIds}
        onPickVariant={addVariant}
      />
    </PageFade>
  );
}
