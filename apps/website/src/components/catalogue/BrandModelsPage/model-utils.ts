import type { CatalogueModel } from "@/lib/catalogue/types";
import type { VehicleCategory } from "@/lib/preferences";
import { formatINR } from "@/lib/utils";

export function toPositiveNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function humanizeSegment(raw: string): string {
  const s = raw.trim();
  if (!s) return "—";
  return s
    .replace(/_/g, " ")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function primaryModelKey(model: CatalogueModel): string {
  const key = model.id ?? model.slug ?? model.model_slug ?? model.model_name ?? "";
  return String(key || "model");
}

/** Aligns with Autolokate `CarsPageApi` grid card pricing. */
export function formatModelPriceBlock(model: CatalogueModel): {
  line: string;
  hint?: string;
} {
  const min = toPositiveNumber(model.min_price ?? model.starting_price);
  const max = toPositiveNumber(model.max_price);
  if (min == null && max == null)
    return { line: "Price on request", hint: "Contact for quote" };
  if (min != null && max != null && max > min + 500) {
    return {
      line: `From ${formatINR(min)}`,
      hint: `Up to ${formatINR(max)} · Ex-showroom`,
    };
  }
  const n = min ?? max ?? 0;
  return { line: formatINR(n), hint: "Ex-showroom" };
}

export function brandLabelForModel(model: CatalogueModel, fallback: string): string {
  const direct = String(model.brand_name ?? "").trim();
  if (direct) return direct;
  const b = model.brand;
  if (
    b &&
    typeof b === "object" &&
    typeof (b as Record<string, unknown>).name === "string"
  ) {
    const n = String((b as { name?: string }).name ?? "").trim();
    if (n) return n;
  }
  return fallback;
}

export function modelLabelFor(model: CatalogueModel): string {
  return String(model.model_name ?? model.name ?? "").trim() || "Model";
}

export function buildModelMetaLine(model: CatalogueModel): string {
  const bodyRaw = String(model.body_type ?? "").trim();
  const body = bodyRaw ? humanizeSegment(bodyRaw) : "";

  const fuelParts =
    Array.isArray(model.fuel_types) && model.fuel_types.length
      ? model.fuel_types.map((f) => humanizeSegment(String(f)))
      : [];
  const primaryFuel =
    typeof model.fuel_type === "string" && model.fuel_type.trim()
      ? humanizeSegment(model.fuel_type)
      : "";
  const fuelLabel = fuelParts.length ? fuelParts.join(" · ") : primaryFuel || "";

  const launchYearRaw = model.launch_year as unknown;
  const launchYear =
    typeof launchYearRaw === "number" && launchYearRaw > 1900 ? launchYearRaw : null;

  const vehicleCatRaw = model.vehicle_category;
  const vehicleCat =
    typeof vehicleCatRaw === "string" && vehicleCatRaw.trim()
      ? humanizeSegment(vehicleCatRaw)
      : null;

  const brandNest =
    model.brand && typeof model.brand === "object"
      ? (model.brand as Record<string, unknown>)
      : null;
  const country =
    typeof brandNest?.country === "string" && brandNest.country.trim()
      ? brandNest.country.trim()
      : null;

  const variants = toPositiveNumber(model.variant_count);

  const discontinued = model.is_discontinued === true;

  return [
    body || null,
    fuelLabel && fuelLabel !== "—" ? fuelLabel : null,
    launchYear != null ? `Since ${launchYear}` : null,
    vehicleCat,
    country,
    variants != null ? `${variants} variants` : null,
    discontinued ? "Discontinued" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detailsHrefForModel(
  vehicleType: VehicleCategory,
  pageBrandSlug: string,
  model: CatalogueModel,
): string {
  const modelSlug = String(model.slug ?? model.model_slug ?? "").trim();
  const brandSlug = String(model.brand_slug ?? "").trim() || pageBrandSlug;
  if (!modelSlug) return `/${vehicleType}/${encodeURIComponent(pageBrandSlug)}`;
  return `/${vehicleType}/${encodeURIComponent(brandSlug)}/${encodeURIComponent(modelSlug)}`;
}

/** Search blob mirroring Autolokate listing search behaviour. */
export function modelSearchBlob(
  model: CatalogueModel,
  displayFallback: string,
  pageBrandSlug: string,
): string {
  const b = brandLabelForModel(model, displayFallback);
  const m = modelLabelFor(model);
  return `${b} ${m} ${String(model.slug ?? "")} ${String(model.brand_slug ?? "")} ${pageBrandSlug}`
    .toLowerCase()
    .trim();
}

export function sortModelLabelKey(model: CatalogueModel, displayFallback: string): string {
  return `${brandLabelForModel(model, displayFallback).toLowerCase()}\u0000${modelLabelFor(model).toLowerCase()}`;
}

export function priceLow(model: CatalogueModel): number {
  return (
    toPositiveNumber(model.min_price ?? model.starting_price) ??
    toPositiveNumber(model.max_price) ??
    0
  );
}

export function priceHigh(model: CatalogueModel): number {
  const hi = toPositiveNumber(model.max_price);
  const lo = toPositiveNumber(model.min_price ?? model.starting_price);
  if (hi != null) return hi;
  return lo ?? 0;
}
