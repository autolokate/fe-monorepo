import type { CatalogueBrand, CatalogueModel, CatalogueVariant } from './types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Coerce a loosely-typed catalogue field to a string. Strings pass through and
 * numbers stringify; objects/arrays/nullish collapse to `''` (so a nested object
 * never leaks as `[object Object]`).
 */
export function toStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

export function readArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!isRecord(value)) return [];
  if (Array.isArray(value.items)) return value.items as T[];
  if (Array.isArray(value.results)) return value.results as T[];
  if (Array.isArray(value.rows)) return value.rows as T[];
  if (Array.isArray(value.data)) return value.data as T[];
  return [];
}

export function readObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

/** Unwrap a `{ success, data }` envelope, returning the inner value. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T is load-bearing: callers (e.g. prices-api) rely on contextual inference of the return type; this is the documented unbox<T>() cast contract, and dropping the generic would break call sites outside this file.
export function unbox<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return (payload.data ?? null) as T;
  }
  return payload as T;
}

export function normalizeBrand(raw: unknown): CatalogueBrand {
  const row = readObject(raw);
  const name = toStr(row.name ?? row.brand_name ?? row.title).trim();
  const slug = toStr(row.slug ?? row.brand_slug).trim();
  return {
    ...row,
    name,
    brand_name: name,
    slug,
    brand_slug: slug,
    logo_url:
      (typeof row.logo_url === 'string' && row.logo_url) ||
      (typeof row.image_url === 'string' && row.image_url) ||
      null,
    vehicle_category: typeof row.vehicle_category === 'string' ? row.vehicle_category : null,
  };
}

export function normalizeModel(raw: unknown): CatalogueModel {
  const row = readObject(raw);
  const brand = readObject(row.brand);
  const brandName = toStr(row.brand_name ?? brand.name).trim();
  const brandSlug = toStr(row.brand_slug ?? brand.slug).trim();
  const modelName = toStr(row.model_name ?? row.name).trim();
  const modelSlug = toStr(row.model_slug ?? row.slug).trim();
  const fuelTypes = Array.isArray(row.fuel_types)
    ? (row.fuel_types as unknown[]).map((f) => String(f))
    : [];
  const primaryFuel = typeof row.fuel_type === 'string' ? row.fuel_type : fuelTypes[0];

  const startingPrice = numericOrNull(row.starting_price ?? row.min_price ?? row.max_price);
  const minPrice = numericOrNull(row.min_price ?? row.starting_price);
  const maxPrice = numericOrNull(row.max_price ?? row.ending_price);

  const heroImage =
    (typeof row.hero_image_url === 'string' && row.hero_image_url) ||
    (typeof row.image_url === 'string' && row.image_url) ||
    (typeof row.thumbnail_url === 'string' && row.thumbnail_url) ||
    null;

  return {
    ...row,
    id: typeof row.id === 'string' ? row.id : undefined,
    slug: modelSlug,
    name: modelName,
    model_name: modelName,
    model_slug: modelSlug,
    brand_name: brandName || undefined,
    brand_slug: brandSlug || undefined,
    fuel_type: primaryFuel,
    fuel_types: fuelTypes,
    starting_price: startingPrice,
    min_price: minPrice,
    max_price: maxPrice,
    hero_image_url: heroImage,
    body_type: typeof row.body_type === 'string' ? row.body_type : null,
    vehicle_category: typeof row.vehicle_category === 'string' ? row.vehicle_category : null,
  };
}

function numericOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeVariant(raw: unknown): CatalogueVariant {
  const row = readObject(raw);
  const price = readObject(row.price);
  const exShowroom = row.ex_showroom_price ?? row.price ?? row.min_price ?? price.ex_showroom_price;
  return {
    ...row,
    variant_name: toStr(row.variant_name ?? row.name),
    brand_slug: row.brand_slug != null ? toStr(row.brand_slug) : undefined,
    brand_name: row.brand_name != null ? toStr(row.brand_name) : undefined,
    model_slug: row.model_slug != null ? toStr(row.model_slug) : undefined,
    model_name: row.model_name != null ? toStr(row.model_name) : undefined,
    fuel_type: row.fuel_type != null ? toStr(row.fuel_type) : undefined,
    ex_showroom_price: numericOrNull(exShowroom),
    min_price: numericOrNull(row.min_price ?? exShowroom),
    max_price: numericOrNull(row.max_price ?? exShowroom),
  };
}

/** Pull a useful set of brand names out of a normalised brand array. */
export function dedupeBrandNames(rows: CatalogueBrand[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    const n = r.brand_name.trim();
    if (n) set.add(n);
  }
  return Array.from(set);
}
