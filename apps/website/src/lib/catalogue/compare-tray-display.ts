import type { CatalogueModel, CatalogueVariant } from "@/lib/catalogue/types";
import { variantThumb } from "@/lib/catalogue/compare-matrix";

export function modelHeroImage(model: CatalogueModel | undefined): string | null {
  if (!model) return null;
  const u = model.hero_image_url;
  return typeof u === "string" && u.trim() ? u.trim() : null;
}

function bodyTypeLine(model: CatalogueModel | undefined): string {
  const b = model?.body_type;
  return typeof b === "string" && b.trim() ? b.trim() : "";
}

/** Brand + model — matches compare slot cards. */
export function compareTrayTitleLine(
  variant: CatalogueVariant | undefined,
  model: CatalogueModel | undefined,
): string {
  const line = [
    variant?.brand_name ?? model?.brand_name,
    variant?.model_name ?? model?.model_name,
  ]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .join(" ");
  return line.trim();
}

/** Trim / body line under the title — matches compare slot cards. */
export function compareTraySubtitle(
  variant: CatalogueVariant | undefined,
  model: CatalogueModel | undefined,
): string {
  const trim =
    (variant && String(variant.variant_name ?? variant.name ?? "").trim()) || "";
  const body = bodyTypeLine(model);
  if (trim && body) return `${trim} · ${body}`;
  return trim || body || (variant ? "Variant" : "Model");
}

export function compareTrayPrice(
  variant: CatalogueVariant | undefined,
  model: CatalogueModel | undefined,
): number | null {
  const candidate =
    variant?.ex_showroom_price ??
    variant?.min_price ??
    variant?.max_price ??
    model?.starting_price ??
    model?.min_price ??
    model?.max_price ??
    null;
  return typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0
    ? candidate
    : null;
}

export function compareTrayThumb(
  variant: CatalogueVariant | undefined,
  model: CatalogueModel | undefined,
): string | null {
  return (variant ? variantThumb(variant) : null) || modelHeroImage(model);
}
