import type { VehicleCategory } from "@/lib/preferences/types";

/**
 * Compare uses `/{cars|bikes}/compare?model=` with segments joined by the literal delimiter `vvs`.
 * Each vehicle is `brandSlug__modelSlug` (double underscore separates brand vs model).
 *
 * Example:
 *   `/cars/compare?model=tata__hariervvsmg__astorvvshyundai__creta`
 */

export const COMPARE_MODEL_SEGMENT_DELIMITER = "vvs";

export type CompareModelSegment = {
  brandSlug: string;
  modelSlug: string;
};

export function compareRootPath(vehicleCategory: VehicleCategory): string {
  return `/${vehicleCategory}/compare`;
}

/** Legacy comma-separated variant UUIDs (`?ids=`) — parsed for backwards compatibility. */
export function parseCompareIdsParam(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean)
    .slice(0, 3);
}

/** Decode `?model=` into ordered brand/model pairs (max 3). */
export function parseCompareModelParam(raw: string | null | undefined): CompareModelSegment[] {
  if (!raw?.trim()) return [];
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* use raw */
  }

  return decoded
    .split(COMPARE_MODEL_SEGMENT_DELIMITER)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => {
      const idx = part.indexOf("__");
      if (idx <= 0) return null;
      const brandSlug = part.slice(0, idx).trim();
      const modelSlug = part.slice(idx + 2).trim();
      if (!brandSlug || !modelSlug) return null;
      return { brandSlug, modelSlug };
    })
    .filter((x): x is CompareModelSegment => x !== null);
}

export function serializeCompareModelSegments(segments: CompareModelSegment[]): string {
  return segments
    .slice(0, 3)
    .map(({ brandSlug, modelSlug }) => `${brandSlug}__${modelSlug}`)
    .join(COMPARE_MODEL_SEGMENT_DELIMITER);
}

/** Path + query only, e.g. `/cars/compare?model=…` */
export function comparePathWithModelSegments(
  segments: CompareModelSegment[],
  vehicleCategory: VehicleCategory,
): string {
  const serialized = serializeCompareModelSegments(segments);
  const base = compareRootPath(vehicleCategory);
  if (!serialized) return base;
  return `${base}?model=${encodeURIComponent(serialized)}`;
}

/** Compare URL using variant UUIDs (`?ids=`). Legacy / alternate links only. */
export function comparePathWithVariantIds(
  vehicleCategory: VehicleCategory,
  variantIds: string[],
): string {
  const cleaned = variantIds.map((id) => id.trim()).filter(Boolean).slice(0, 3);
  const base = compareRootPath(vehicleCategory);
  if (!cleaned.length) return base;
  const q = cleaned.map((id) => encodeURIComponent(id)).join(",");
  return `${base}?ids=${q}`;
}
