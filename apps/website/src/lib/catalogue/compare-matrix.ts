import type { CatalogueVariant } from "@/lib/catalogue/types";
import type { VehicleCategory } from "@/lib/preferences/types";
import type { TaxonomyBundle } from "@/services/taxonomy/taxonomy-api";
import { formatINR } from "@/lib/utils";

export type CompareTabId = "overview" | "specs" | "features" | "safety";

export type CompareMatrixRow = {
  key: string;
  label: string;
  values: string[];
};

const BLOCKED_SCALAR_KEYS = new Set([
  "id",
  "brand",
  "model",
  "price",
  "features",
  "reviews",
  "created_at",
  "updated_at",
  "slug",
  "image_url",
  "thumbnail_url",
  "hero_image_url",
]);

const OVERVIEW_KEYS: string[] = [
  "ex_showroom_price",
  "min_price",
  "max_price",
  "fuel_type",
  "fuel_types",
  "transmission",
  "mileage",
  "fuel_efficiency",
  "range_km",
  "arai_certified_range",
  "engine",
  "engine_displacement",
  "displacement",
  "power",
  "max_power",
  "torque",
  "max_torque",
  "seating_capacity",
  "boot_space",
  "boot_capacity",
  "ground_clearance",
  "length",
  "width",
  "wheelbase",
];

const SAFETY_KEY_RE =
  /safety|ncap|airbag|abs|ebd|esc|tpms|isofix|brake assist|crash/i;

export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function formatCompareScalar(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    const looksPrice =
      /price|ex_showroom|on.?road|emi|lakh/i.test(key) ||
      key === "min_price" ||
      key === "max_price";
    if (looksPrice && value >= 1000) return `${formatINR(value)} Ex-showroom`;
    return String(value);
  }
  if (typeof value === "string") return value.trim() || "—";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ") || "—";
  return "—";
}

function labelForKey(key: string, taxonomy: TaxonomyBundle | undefined): string {
  const lower = key.toLowerCase();
  if (!taxonomy) return humanizeKey(key);

  for (const s of taxonomy.specs) {
    if (s.canonical_key?.toLowerCase() === lower) {
      return s.display_name || humanizeKey(key);
    }
  }
  for (const f of taxonomy.features) {
    if (f.canonical_key?.toLowerCase() === lower) {
      return f.display_name || humanizeKey(key);
    }
  }
  return humanizeKey(key);
}

function specGroupForKey(key: string, taxonomy: TaxonomyBundle | undefined): string | null {
  const lower = key.toLowerCase();
  if (!taxonomy) return null;
  const row = taxonomy.specs.find((s) => s.canonical_key?.toLowerCase() === lower);
  return row?.spec_group?.toLowerCase() ?? null;
}

function featureGroupForKey(key: string, taxonomy: TaxonomyBundle | undefined): string | null {
  const lower = key.toLowerCase();
  if (!taxonomy) return null;
  const row = taxonomy.features.find((f) => f.canonical_key?.toLowerCase() === lower);
  return row?.feature_group?.toLowerCase() ?? null;
}

function collectScalarKeys(variants: CatalogueVariant[]): Set<string> {
  const keys = new Set<string>();
  for (const v of variants) {
    for (const k of Object.keys(v)) {
      if (BLOCKED_SCALAR_KEYS.has(k)) continue;
      const val = v[k];
      if (val === null || val === undefined) continue;
      if (typeof val === "object" && !Array.isArray(val)) continue;
      keys.add(k);
    }
  }
  return keys;
}

function variantValue(variant: CatalogueVariant, key: string): unknown {
  return variant[key];
}

function rowFromKey(
  key: string,
  variants: CatalogueVariant[],
  taxonomy: TaxonomyBundle | undefined,
): CompareMatrixRow {
  return {
    key,
    label: labelForKey(key, taxonomy),
    values: variants.map((v) => formatCompareScalar(key, variantValue(v, key))),
  };
}

/** Nested catalogue feature buckets rendered only under the Features tab. */
export function flattenNestedFeatureRows(variants: CatalogueVariant[]): CompareMatrixRow[] {
  const labelToValues = new Map<string, string[]>();

  variants.forEach((v, vi) => {
    const feats = v.features;
    if (!feats || typeof feats !== "object") return;

    for (const [group, bucket] of Object.entries(feats)) {
      if (!bucket || typeof bucket !== "object") continue;
      for (const [subKey, raw] of Object.entries(bucket as Record<string, unknown>)) {
        const label = `${humanizeKey(group)} · ${humanizeKey(subKey)}`;
        const cell =
          typeof raw === "boolean"
            ? raw
              ? "Yes"
              : "No"
            : typeof raw === "object"
              ? JSON.stringify(raw)
              : String(raw ?? "—");

        if (!labelToValues.has(label)) {
          labelToValues.set(label, Array.from({ length: variants.length }, () => "—"));
        }
        const arr = labelToValues.get(label)!;
        arr[vi] = cell;
      }
    }
  });

  return [...labelToValues.entries()].map(([label, values]) => ({
    key: `feat:${label}`,
    label,
    values,
  }));
}

export function buildCompareRowsForTab(
  tab: CompareTabId,
  variants: CatalogueVariant[],
  taxonomy: TaxonomyBundle | undefined,
): CompareMatrixRow[] {
  if (variants.length < 2) return [];

  const keys = collectScalarKeys(variants);
  const nestedFeatures = flattenNestedFeatureRows(variants);

  const overviewSet = new Set(OVERVIEW_KEYS.map((k) => k.toLowerCase()));

  if (tab === "overview") {
    const ordered = OVERVIEW_KEYS.filter((k) => keys.has(k));
    const primary = ordered.map((k) => rowFromKey(k, variants, taxonomy));

    const standout = variants.map((v) => {
      const raw = v.highlight_features ?? v.key_features ?? v.standout_features;
      if (Array.isArray(raw)) return raw.map((x) => String(x)).join(", ") || "—";
      if (typeof raw === "string") return raw.trim() || "—";
      return "—";
    });
    const hasStandout = standout.some((s) => s !== "—");

    const combined = [...primary];
    if (hasStandout) {
      combined.push({ key: "standout_features", label: "Standout features", values: standout });
    }
    return combined;
  }

  if (tab === "specs") {
    const specKeys = [...keys].filter((k) => {
      const kl = k.toLowerCase();
      if (overviewSet.has(kl)) return false;
      if (SAFETY_KEY_RE.test(kl)) return false;
      if (taxonomy?.features.some((f) => f.canonical_key?.toLowerCase() === kl)) return false;
      const fg = featureGroupForKey(k, taxonomy);
      if (fg?.includes("safety")) return false;
      return true;
    });
    specKeys.sort((a, b) =>
      labelForKey(a, taxonomy).localeCompare(labelForKey(b, taxonomy)),
    );
    return specKeys.map((k) => rowFromKey(k, variants, taxonomy));
  }

  if (tab === "features") {
    const featKeys = [...keys].filter((k) => {
      const kl = k.toLowerCase();
      if (SAFETY_KEY_RE.test(kl)) return false;
      return taxonomy?.features.some((f) => f.canonical_key?.toLowerCase() === kl) === true;
    });
    featKeys.sort((a, b) =>
      labelForKey(a, taxonomy).localeCompare(labelForKey(b, taxonomy)),
    );
    const flatRows = featKeys.map((k) => rowFromKey(k, variants, taxonomy));
    return [...flatRows, ...nestedFeatures];
  }

  if (tab === "safety") {
    const safetyKeys = [...keys].filter((k) => {
      const kl = k.toLowerCase();
      if (SAFETY_KEY_RE.test(kl)) return true;
      const sg = specGroupForKey(k, taxonomy);
      const fg = featureGroupForKey(k, taxonomy);
      return Boolean(sg?.includes("safety") || fg?.includes("safety"));
    });
    safetyKeys.sort((a, b) =>
      labelForKey(a, taxonomy).localeCompare(labelForKey(b, taxonomy)),
    );
    return safetyKeys.map((k) => rowFromKey(k, variants, taxonomy));
  }

  return [];
}

export function variantDetailHref(
  v: CatalogueVariant,
  vehicleCategory: VehicleCategory,
): string | null {
  const brand = String(v.brand_slug ?? "").trim();
  const model = String(v.model_slug ?? "").trim();
  if (!brand || !model) return null;
  return `/${vehicleCategory}/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`;
}

export function variantThumb(v: CatalogueVariant): string | null {
  const hero = typeof v.hero_image_url === "string" ? v.hero_image_url.trim() : "";
  const img = typeof v.image_url === "string" ? v.image_url.trim() : "";
  const thumb = typeof v.thumbnail_url === "string" ? v.thumbnail_url.trim() : "";
  const u = hero || img || thumb;
  return u || null;
}
