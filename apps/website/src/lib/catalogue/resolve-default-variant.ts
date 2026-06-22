"use client";

import { getModelVariants } from "@/services/catalogue/catalogue-api";
import type { CatalogueModel, CatalogueVariant } from "@/lib/catalogue/types";
import { slugifyPart } from "@/lib/seo/slugs";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function readText(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function readNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Preference order: flagged default/popular, then lowest price, then first row. */
export function pickDefaultCatalogueVariant(
  variants: CatalogueVariant[],
): CatalogueVariant | null {
  if (!variants.length) return null;

  const flagged = variants.find((v) => v.is_default === true || v.is_popular === true);
  if (flagged) return flagged;

  const priced = variants
    .map((v) => ({
      row: v,
      price:
        readNumber(v.ex_showroom_price ?? v.min_price ?? v.price) ??
        Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => a.price - b.price);
  if (priced[0]?.row) return priced[0].row;

  return variants[0] ?? null;
}

function readBrandSlugFromModel(model: CatalogueModel): string | null {
  const direct = readText(model.brand_slug);
  if (direct) return direct;

  const brandObj = isRecord(model.brand) ? model.brand : null;
  if (brandObj) {
    const nested = readText(brandObj.slug);
    if (nested) return nested;
    const nestedName = readText(brandObj.name);
    if (nestedName) return slugifyPart(nestedName);
  }

  const brandName = readText(model.brand_name);
  return brandName ? slugifyPart(brandName) : null;
}

function readModelSlug(model: CatalogueModel): string | null {
  const direct = readText(model.model_slug) ?? readText(model.slug);
  if (direct) return direct;
  const modelName = readText(model.model_name) ?? readText(model.name);
  return modelName ? slugifyPart(modelName) : null;
}

export type CompareModelSlugPair = { brandSlug: string; modelSlug: string };

/** Resolve brand + model slugs to a default catalogue variant UUID (compare API). */
export async function resolveBrandModelToVariantId(
  brandSlug: string,
  modelSlug: string,
): Promise<string | null> {
  const b = brandSlug.trim();
  const m = modelSlug.trim();
  if (!b || !m) return null;
  try {
    const variants = await getModelVariants(b, m);
    const preferred = pickDefaultCatalogueVariant(variants);
    const id = preferred?.id;
    return typeof id === "string" && id.replace(/-/g, "").length >= 16 ? id : null;
  } catch {
    return null;
  }
}

export function compareSegmentFromVariant(row: CatalogueVariant): CompareModelSlugPair | null {
  const b = readText(row.brand_slug);
  const m = readText(row.model_slug);
  if (!b || !m) return null;
  return { brandSlug: b, modelSlug: m };
}

export function compareSegmentFromModel(row: CatalogueModel): CompareModelSlugPair | null {
  const b = readBrandSlugFromModel(row);
  const m = readModelSlug(row);
  if (!b || !m) return null;
  return { brandSlug: b, modelSlug: m };
}

/** Pick one stable catalogue variant id for a model row (compare tray). */
export async function resolveCatalogueModelToVariantId(
  model: CatalogueModel,
): Promise<string | null> {
  const explicit = model.default_variant_id;
  if (typeof explicit === "string" && explicit.replace(/-/g, "").length >= 16) {
    return explicit;
  }

  const brandSlug = readBrandSlugFromModel(model);
  const modelSlug = readModelSlug(model);
  if (!brandSlug || !modelSlug) return null;

  return resolveBrandModelToVariantId(brandSlug, modelSlug);
}
