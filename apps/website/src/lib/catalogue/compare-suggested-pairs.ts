import { fromApiVehicleCategory, type VehicleCategory } from "@/lib/preferences";
import { getTrendingModels } from "@/services/catalogue/catalogue-api";
import type { CatalogueModel } from "@/lib/catalogue/types";
import { compareSegmentFromModel, resolveCatalogueModelToVariantId } from "@/lib/catalogue/resolve-default-variant";

export type CompareSuggestedEntry = {
  variantId: string;
  brandSlug: string;
  modelSlug: string;
  brandLabel: string;
  modelLabel: string;
  image: string | null;
  price: number | null;
};

const MAX_MODELS_SCAN = 14;
const MAX_SUGGESTED_VARIANTS = 8;
const MAX_PAIRS = 4;

function trendingModelMatchesCategory(model: CatalogueModel, vehicleCategory: VehicleCategory): boolean {
  const raw = model.vehicle_category;
  if (raw == null || String(raw).trim() === "") return true;
  const mapped = fromApiVehicleCategory(String(raw));
  if (!mapped) return true;
  return mapped === vehicleCategory;
}

function heroOrThumb(model: CatalogueModel): string | null {
  const h = typeof model.hero_image_url === "string" ? model.hero_image_url.trim() : "";
  return h || null;
}

/**
 * Loads trending models (`GET /v1/catalogue/trending`), resolves a default variant per model
 * (`resolveCatalogueModelToVariantId` → may call `GET .../variants`), and returns up to 8
 * unique entries for pairing in the compare “suggested pairs” strip.
 */
export async function fetchCompareSuggestedEntries(
  vehicleCategory: VehicleCategory,
): Promise<CompareSuggestedEntry[]> {
  const trending = await getTrendingModels();
  const filtered = trending
    .filter((m) => trendingModelMatchesCategory(m, vehicleCategory))
    .slice(0, MAX_MODELS_SCAN);

  const out: CompareSuggestedEntry[] = [];
  for (const row of filtered) {
    if (out.length >= MAX_SUGGESTED_VARIANTS) break;
    const segment = compareSegmentFromModel(row);
    if (!segment) continue;

    const variantId = await resolveCatalogueModelToVariantId(row);
    if (!variantId || out.some((x) => x.variantId === variantId)) continue;

    const minPrice = row.min_price;
    const price = typeof minPrice === "number" && minPrice > 0 ? minPrice : null;

    out.push({
      variantId,
      brandSlug: segment.brandSlug,
      modelSlug: segment.modelSlug,
      brandLabel: String(row.brand_name ?? "").trim() || "—",
      modelLabel: String(row.model_name ?? row.name ?? "").trim() || "—",
      image: heroOrThumb(row),
      price,
    });
  }
  return out;
}

export function groupCompareSuggestedPairs(
  entries: CompareSuggestedEntry[],
): [CompareSuggestedEntry, CompareSuggestedEntry][] {
  const pairs: [CompareSuggestedEntry, CompareSuggestedEntry][] = [];
  for (let i = 0; i + 1 < entries.length && pairs.length < MAX_PAIRS; i += 2) {
    pairs.push([entries[i]!, entries[i + 1]!]);
  }
  return pairs;
}
