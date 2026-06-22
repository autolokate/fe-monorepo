import type { CatalogueModelDetailPayload } from "@/lib/catalogue/types";
import type { CatalogueModel, CatalogueVariant } from "@/lib/catalogue/types";
import {
  getBrandModels,
  getModelDetails,
  getModelVariants,
  getVariantDetails,
  searchCatalogue,
} from "@/services/catalogue/catalogue-api";

type ApiGroupRow = Record<string, unknown>;

function toDisplayValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    const v = value.trim();
    return v ? v : null;
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) =>
        typeof item === "string" || typeof item === "number" ? String(item).trim() : "",
      )
      .filter(Boolean);
    return items.length ? items.join(", ") : null;
  }
  return null;
}

function normalizeSpecGroups(details: Record<string, unknown>) {
  const groupsMap = new Map<string, Map<string, ApiGroupRow>>();
  const pushRow = (groupName: string, key: string, row: ApiGroupRow) => {
    const normalizedGroup = groupName.trim().toLowerCase() || "other";
    const normalizedKey = key.trim().toLowerCase();
    if (!normalizedKey) return;
    if (!groupsMap.has(normalizedGroup)) {
      groupsMap.set(normalizedGroup, new Map<string, ApiGroupRow>());
    }
    const groupBucket = groupsMap.get(normalizedGroup)!;
    if (!groupBucket.has(normalizedKey)) groupBucket.set(normalizedKey, row);
  };

  const grouped = Array.isArray(details.spec_groups)
    ? (details.spec_groups as ApiGroupRow[])
    : [];
  for (const group of grouped) {
    const groupName = String(group.group ?? "other");
    const specs = Array.isArray(group.specs) ? (group.specs as ApiGroupRow[]) : [];
    for (const spec of specs) {
      const key = String(spec.key ?? spec.spec_key ?? spec.display_name ?? "").trim();
      const displayName = String(
        spec.display_name ?? spec.key ?? spec.spec_key ?? "",
      ).trim();
      const value = toDisplayValue(spec.value ?? spec.spec_value);
      if (!key || !value) continue;
      pushRow(groupName, key, {
        key,
        display_name: displayName || key,
        value,
      });
    }
  }

  if (groupsMap.size === 0 && Array.isArray(details.specs)) {
    const flatSpecs = details.specs as ApiGroupRow[];
    for (const spec of flatSpecs) {
      const groupName = String(spec.spec_group ?? "other");
      const key = String(spec.spec_key ?? spec.key ?? "").trim();
      const value = toDisplayValue(spec.spec_value ?? spec.value);
      if (!key || !value) continue;
      pushRow(groupName, key, {
        key,
        display_name: String(spec.display_name ?? key),
        value,
      });
    }
  }

  return [...groupsMap.entries()].map(([group, rows]) => ({
    group,
    specs: [...rows.values()] as Array<{
      key: string;
      display_name: string;
      value: string;
    }>,
  }));
}

function normalizeFeatureGroups(
  details: Record<string, unknown>,
  variants: CatalogueVariant[],
) {
  const dedupRows = new Map<string, ApiGroupRow>();
  const featureGroups = Array.isArray(details.feature_groups)
    ? (details.feature_groups as ApiGroupRow[])
    : [];
  const mergedFeatureValueMap: Record<string, Record<string, string>> = {};

  for (const group of featureGroups) {
    const rows = Array.isArray(group.features) ? (group.features as ApiGroupRow[]) : [];
    for (const row of rows) {
      const groupKey = String(row.key ?? row.display_name ?? "")
        .trim()
        .toLowerCase();
      const value = row.value;
      if (!groupKey || !value || typeof value !== "object") continue;
      const objectValue = value as Record<string, unknown>;
      if (!mergedFeatureValueMap[groupKey]) mergedFeatureValueMap[groupKey] = {};
      for (const [k, v] of Object.entries(objectValue)) {
        const displayValue = toDisplayValue(v);
        if (!displayValue) continue;
        if (!mergedFeatureValueMap[groupKey][k]) mergedFeatureValueMap[groupKey][k] = displayValue;
      }
      if (!dedupRows.has(groupKey)) {
        dedupRows.set(groupKey, {
          key: groupKey,
          display_name: groupKey,
          value: mergedFeatureValueMap[groupKey],
        });
      }
    }
  }

  if (dedupRows.size === 0) {
    for (const variant of variants) {
      const featureMap =
        (variant.features as Record<string, unknown> | undefined) ?? {};
      for (const [category, featureValues] of Object.entries(featureMap)) {
        if (!featureValues || typeof featureValues !== "object") continue;
        const groupKey = category.trim().toLowerCase();
        if (!groupKey) continue;
        if (!mergedFeatureValueMap[groupKey]) mergedFeatureValueMap[groupKey] = {};
        for (const [k, v] of Object.entries(featureValues as Record<string, unknown>)) {
          const displayValue = toDisplayValue(v);
          if (!displayValue) continue;
          if (!mergedFeatureValueMap[groupKey][k]) mergedFeatureValueMap[groupKey][k] = displayValue;
        }
      }
    }
    for (const [groupKey, value] of Object.entries(mergedFeatureValueMap)) {
      dedupRows.set(groupKey, { key: groupKey, display_name: groupKey, value });
    }
  }

  return [
    {
      group: "other",
      features: [...dedupRows.values()] as Array<{
        key: string;
        display_name: string;
        value: Record<string, string>;
      }>,
    },
  ];
}

async function resolveBrandAndModelSlug(
  slug: string,
): Promise<{ brandSlug: string; modelSlug: string } | null> {
  const rows = await searchCatalogue(slug.replace(/-/g, " "));
  const wanted = slug.toLowerCase();
  const model = rows.find(
    (row) => String(row.slug ?? "").toLowerCase() === wanted,
  ) as Record<string, unknown> | undefined;
  if (!model) return null;
  const modelSlug = String(model.slug ?? "").trim();
  const brandObj = (model.brand as Record<string, unknown> | undefined) ?? {};
  const brandSlug = String(model.brand_slug ?? brandObj.slug ?? "").trim();
  if (!brandSlug || !modelSlug) return null;
  return { brandSlug, modelSlug };
}

/**
 * Fetches catalogue model detail the same way as Autolokate `LiveModelDetailLoader`:
 * parallel brand models + model + variants, optional slug resolution, per-variant details.
 */
export async function fetchCatalogueModelDetailPayload(
  brandSlugIn: string,
  modelSlugIn: string,
): Promise<CatalogueModelDetailPayload> {
  let brandSlug = String(brandSlugIn ?? "").trim();
  let modelSlug = String(modelSlugIn ?? "").trim();
  if (!brandSlug || !modelSlug) {
    throw new Error("Model not found");
  }

  const loadByPair = async (brand: string, model: string) => {
    const [models, details, variants] = await Promise.all([
      getBrandModels(brand),
      getModelDetails(brand, model),
      getModelVariants(brand, model),
    ]);
    if (!details) throw new Error("Model not found");
    return { models, details, variants, brand, model };
  };

  let loaded: {
    models: CatalogueModel[];
    details: CatalogueModel;
    variants: CatalogueVariant[];
    brand: string;
    model: string;
  };

  try {
    loaded = await loadByPair(brandSlug, modelSlug);
  } catch {
    const resolved = await resolveBrandAndModelSlug(modelSlug);
    if (!resolved) throw new Error("Model not found");
    loaded = await loadByPair(resolved.brandSlug, resolved.modelSlug);
    brandSlug = resolved.brandSlug;
    modelSlug = resolved.modelSlug;
  }

  const { models, details, variants } = loaded;
  const detailsRec = details as unknown as Record<string, unknown>;

  const listing =
    models.find((m) => String(m.slug ?? "").toLowerCase() === modelSlug.toLowerCase()) ??
    details;

  const withDetails = await Promise.all(
    variants.map(async (variant) => {
      const variantSlug = String(variant.slug ?? "").trim();
      if (!variantSlug) return variant;
      try {
        const full = await getVariantDetails(brandSlug, modelSlug, variantSlug);
        return { ...variant, ...full };
      } catch {
        return variant;
      }
    }),
  );

  const variantReviews = withDetails.flatMap((variant) => {
    const rows = variant.reviews;
    return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
  });
  const modelReviews = Array.isArray(detailsRec.reviews)
    ? (detailsRec.reviews as Record<string, unknown>[])
    : [];
  const reviewMap = new Map<string, Record<string, unknown>>();
  [...modelReviews, ...variantReviews].forEach((review, idx) => {
    const id = String(review.id ?? review.title ?? review.heading ?? idx).trim();
    const key = id || `review-${idx}`;
    if (!reviewMap.has(key)) reviewMap.set(key, review);
  });

  return {
    brandSlug,
    modelSlug,
    listing: listing as CatalogueModel,
    details: detailsRec,
    variants: withDetails,
    modelImages: Array.isArray(detailsRec.images)
      ? (detailsRec.images as Record<string, unknown>[])
      : [],
    modelColors: Array.isArray(detailsRec.colors)
      ? (detailsRec.colors as Record<string, unknown>[])
      : [],
    specGroups: normalizeSpecGroups(detailsRec),
    featureGroups: normalizeFeatureGroups(detailsRec, withDetails),
    reviews: [...reviewMap.values()],
  };
}
