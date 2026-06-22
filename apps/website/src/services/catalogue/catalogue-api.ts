"use client";

import { endpoints } from "@/lib/api/endpoints";
import { dedupedRequest } from "@/lib/api/dedupe-cache";
import { ApiService } from "@/services/api.service";
import {
  normalizeBrand,
  normalizeModel,
  normalizeVariant,
  readArray,
  readObject,
  unbox,
} from "@/lib/catalogue/normalize";
import type {
  CatalogueBrand,
  CatalogueModel,
  CatalogueVariant,
} from "@/lib/catalogue/types";

/** Shared cache window for "stable" catalogue reads (brands, trending, etc.). */
const CATALOGUE_TTL_MS = 5 * 60_000;

/**
 * GET /v1/catalogue/brands — list every brand the catalogue knows about.
 * Used by the marketplace stats card and the brand grid. The response is
 * deduped + cached for 5 minutes so multiple components reading marketplace
 * stats only trigger one network call per page lifetime.
 */
export async function getBrands(): Promise<CatalogueBrand[]> {
  return dedupedRequest("catalogue:brands", CATALOGUE_TTL_MS, async () => {
    const res = await ApiService.get<unknown>(endpoints.catalogue.brands, {
      withAuth: false,
    });
    const rows = readArray<unknown>(unbox(res.data));
    return rows.map(normalizeBrand);
  });
}

/**
 * GET /v1/catalogue/brands/{slug} — single brand envelope for brand hub UX.
 */
export async function getBrandDetails(brandSlug: string): Promise<CatalogueBrand | null> {
  const trimmed = brandSlug.trim();
  if (!trimmed) return null;
  try {
    const res = await ApiService.get<unknown>(
      endpoints.catalogue.brandBySlug(trimmed),
      { withAuth: false },
    );
    const payload = unbox(res.data);
    if (!payload) return null;
    return normalizeBrand(payload);
  } catch {
    return null;
  }
}

/**
 * GET /v1/catalogue/brands/{slug}/models — model line-up for a brand catalogue page.
 */
export async function getBrandModels(brandSlug: string): Promise<CatalogueModel[]> {
  const trimmed = brandSlug.trim();
  if (!trimmed) return [];

  const res = await ApiService.get<unknown>(endpoints.catalogue.brandModels(trimmed), {
    withAuth: false,
  });
  const rows = readArray<unknown>(unbox(res.data));
  return rows.map((raw) => {
    const row = normalizeModel(raw);
    if (!row.brand_slug?.trim()) {
      return { ...row, brand_slug: trimmed };
    }
    return row;
  });
}

/** GET /v1/catalogue/brands/{brand}/models/{model} — full model record (hero, specs, starting price…). Deduped. */
export async function getModelDetails(
  brandSlug: string,
  modelSlug: string,
): Promise<CatalogueModel | null> {
  const b = brandSlug.trim();
  const m = modelSlug.trim();
  if (!b || !m) return null;
  const key = `catalogue:modelDetails:${b}:${m}`;
  try {
    return await dedupedRequest(key, CATALOGUE_TTL_MS, async () => {
      const res = await ApiService.get<unknown>(endpoints.catalogue.modelDetails(b, m), {
        withAuth: false,
      });
      const payload = unbox(res.data);
      if (!payload) return null;
      const row = normalizeModel(payload);
      return !row.brand_slug?.trim() ? { ...row, brand_slug: b } : row;
    });
  } catch {
    return null;
  }
}

/** GET /v1/catalogue/brands/{brand}/models/{model}/variants */
export async function getModelVariants(
  brandSlug: string,
  modelSlug: string,
): Promise<CatalogueVariant[]> {
  const b = brandSlug.trim();
  const m = modelSlug.trim();
  if (!b || !m) return [];
  const key = `catalogue:modelVariants:${b}:${m}`;
  return dedupedRequest(key, CATALOGUE_TTL_MS, async () => {
    const res = await ApiService.get<unknown>(
      endpoints.catalogue.modelVariants(b, m),
      { withAuth: false },
    );
    const rows = readArray<unknown>(unbox(res.data));
    return rows.map(normalizeVariant);
  });
}

/** GET /v1/catalogue/brands/{brand}/models/{model}/variants/{variant} */
export async function getVariantDetails(
  brandSlug: string,
  modelSlug: string,
  variantSlug: string,
): Promise<CatalogueVariant> {
  const b = brandSlug.trim();
  const m = modelSlug.trim();
  const v = variantSlug.trim();
  if (!v) return {};
  const res = await ApiService.get<unknown>(
    endpoints.catalogue.variantDetails(b, m, v),
    { withAuth: false },
  );
  return normalizeVariant(unbox(res.data));
}

/** GET /v1/catalogue/trending — top picks for the hero trending rail. */
export async function getTrendingModels(): Promise<CatalogueModel[]> {
  return dedupedRequest("catalogue:trending", CATALOGUE_TTL_MS, async () => {
    const res = await ApiService.get<unknown>(endpoints.catalogue.trending, {
      withAuth: false,
    });
    const rows = readArray<unknown>(unbox(res.data));
    return rows.map(normalizeModel);
  });
}

/** GET /v1/catalogue/models — supports optional filter params. */
export async function getModels(
  params?: Record<string, string>,
): Promise<CatalogueModel[]> {
  const res = await ApiService.get<unknown>(endpoints.catalogue.models, {
    params,
    withAuth: false,
  });
  const rows = readArray<unknown>(unbox(res.data));
  return rows.map(normalizeModel);
}

function readModelsEnvelopeCursor(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const meta = (payload as Record<string, unknown>).meta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const c = (meta as Record<string, unknown>).next_cursor;
  return typeof c === "string" && c.trim() ? c.trim() : null;
}

export type CatalogueModelsPageResult = {
  models: CatalogueModel[];
  nextCursor: string | null;
};

/**
 * GET /v1/catalogue/models — cursor-paginated index (`meta.next_cursor`).
 * Preserves the full JSON envelope so pagination metadata is not lost (unlike {@link getModels}).
 */
export async function getCatalogueModelsPage(opts: {
  cursor?: string | null;
} = {}): Promise<CatalogueModelsPageResult> {
  const params: Record<string, string> = {};
  if (opts.cursor) params.cursor = opts.cursor;
  const res = await ApiService.get<unknown>(endpoints.catalogue.models, {
    params: Object.keys(params).length ? params : undefined,
    withAuth: false,
  });
  const envelope = res.data;
  let rowsPayload: unknown = envelope;
  if (envelope && typeof envelope === "object" && !Array.isArray(envelope)) {
    const inner = (envelope as Record<string, unknown>).data;
    if (inner !== undefined) rowsPayload = inner;
  }
  const rows = readArray<unknown>(rowsPayload);
  return {
    models: rows.map(normalizeModel),
    nextCursor: readModelsEnvelopeCursor(envelope),
  };
}

/** GET /v1/catalogue/search?q=… — combined results across models/brands/variants. */
export async function searchCatalogue(query: string): Promise<CatalogueModel[]> {
  const res = await ApiService.get<unknown>(endpoints.catalogue.search, {
    params: { q: query },
    withAuth: false,
  });
  const payload = unbox(res.data);
  if (Array.isArray(payload)) return payload.map(normalizeModel);
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    return readArray<unknown>(p.models).map(normalizeModel);
  }
  return [];
}

/** Normalised search hit for compare picker (models resolve to a default variant separately). */
export type CatalogueSearchHit =
  | { kind: "brand"; row: CatalogueBrand }
  | { kind: "model"; row: CatalogueModel }
  | { kind: "variant"; row: CatalogueVariant };

function classifySearchRow(raw: unknown): CatalogueSearchHit | null {
  const row = readObject(raw);
  const id = row.id;
  const longId = typeof id === "string" && id.replace(/-/g, "").length >= 16;
  const variantLabel = String(row.variant_name ?? "").trim();
  const modelSlug = String(row.model_slug ?? row.slug ?? "").trim();
  const brandSlug = String(row.brand_slug ?? "").trim();

  if (longId && variantLabel) {
    return { kind: "variant", row: normalizeVariant(raw) };
  }
  if (brandSlug && modelSlug && !variantLabel) {
    return { kind: "model", row: normalizeModel(raw) };
  }
  if (longId && (variantLabel || brandSlug)) {
    return { kind: "variant", row: normalizeVariant(raw) };
  }
  const brandish =
    typeof row.name === "string" &&
    !modelSlug &&
    !variantLabel &&
    (typeof row.slug === "string" || typeof row.brand_slug === "string");
  if (brandish) {
    return { kind: "brand", row: normalizeBrand(raw) };
  }
  if (brandSlug || row.brand_name) {
    return { kind: "model", row: normalizeModel(raw) };
  }
  return null;
}

/**
 * GET /v1/catalogue/search?q=… — merges models, variants, and brands when the API returns buckets.
 * Falls back to row-shape classification for legacy array payloads.
 */
export async function searchCatalogueMixed(query: string): Promise<CatalogueSearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const res = await ApiService.get<unknown>(endpoints.catalogue.search, {
    params: { q },
    withAuth: false,
  });
  const payload = unbox(res.data);

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const p = payload as Record<string, unknown>;
    const brands = readArray<unknown>(p.brands).map((raw) => ({
      kind: "brand" as const,
      row: normalizeBrand(raw),
    }));
    const models = readArray<unknown>(p.models).map((raw) => ({
      kind: "model" as const,
      row: normalizeModel(raw),
    }));
    const variants = readArray<unknown>(p.variants).map((raw) => ({
      kind: "variant" as const,
      row: normalizeVariant(raw),
    }));
    const merged = [...variants, ...models, ...brands];
    return merged.length ? merged : [];
  }

  if (Array.isArray(payload)) {
    const out: CatalogueSearchHit[] = [];
    for (const raw of payload) {
      const hit = classifySearchRow(raw);
      if (hit) out.push(hit);
    }
    return out;
  }

  return [];
}

/** GET /v1/catalogue/compare?ids=… — raw envelope from the catalogue service. */
export async function compareVariants(variantIds: string[]): Promise<unknown> {
  const ids = variantIds.map((id) => id.trim()).filter(Boolean).slice(0, 3);
  if (ids.length < 2) return [];

  const res = await ApiService.get<unknown>(endpoints.catalogue.compare(ids), {
    withAuth: false,
  });
  return unbox(res.data);
}

/** Normalised variant rows for compare tables (handles several envelope shapes). */
export async function compareVariantsList(variantIds: string[]): Promise<CatalogueVariant[]> {
  const ids = variantIds.map((id) => id.trim()).filter(Boolean).slice(0, 3);
  if (ids.length < 2) return [];

  const raw = await compareVariants(ids);
  if (Array.isArray(raw)) return raw.map((v) => normalizeVariant(v));

  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.items)) return (o.items as unknown[]).map((v) => normalizeVariant(v));
    if (Array.isArray(o.variants)) return (o.variants as unknown[]).map((v) => normalizeVariant(v));
    if (Array.isArray(o.data)) return (o.data as unknown[]).map((v) => normalizeVariant(v));
    const dataObj = readObject(o.data);
    if (Array.isArray(dataObj.variants)) {
      return (dataObj.variants as unknown[]).map((v) => normalizeVariant(v));
    }
  }

  return [];
}
