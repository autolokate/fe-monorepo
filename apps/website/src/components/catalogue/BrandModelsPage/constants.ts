import type { VehicleCategory } from "@/lib/preferences";

/**
 * Mirrors Autolokate `CarsPageApi` brand listing subtitle
 * (`/cars/brand/[brandSlug]`).
 */
export const BRAND_MODELS_COPY: Record<
  VehicleCategory,
  {
    /** Hero paragraph under the main heading — verbatim from Autolokate. */
    pageSubtitle: string;
    modelsHeading: string;
    backToBrands: string;
    switchBrandLabel: string;
    emptyModels: string;
  }
> = {
  cars: {
    pageSubtitle:
      "This brand's models from the live catalogue — same search, filters, and sorting as the full inventory.",
    modelsHeading: "Models and variants",
    backToBrands: "All car brands",
    switchBrandLabel: "Switch brand",
    emptyModels:
      "We could not load models for this brand yet. Try again shortly or browse the full marketplace.",
  },
  bikes: {
    pageSubtitle:
      "This brand's models from the live catalogue — same search, filters, and sorting as the full inventory.",
    modelsHeading: "Models and variants",
    backToBrands: "All bike brands",
    switchBrandLabel: "Switch brand",
    emptyModels:
      "We could not load models for this brand yet. Try again shortly or browse the full marketplace.",
  },
};
