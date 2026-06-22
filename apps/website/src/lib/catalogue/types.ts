/** Normalised brand row used by the home + listing pages. */
export interface CatalogueBrand {
  id?: string;
  name: string;
  brand_name: string;
  slug: string;
  brand_slug: string;
  logo_url?: string | null;
  vehicle_category?: string | null;
  [key: string]: unknown;
}

/** Normalised model row from `/v1/catalogue/models` / `/v1/catalogue/trending`. */
export interface CatalogueModel {
  id?: string;
  slug: string;
  name: string;
  model_name: string;
  model_slug: string;
  brand_name?: string;
  brand_slug?: string;
  fuel_type?: string;
  fuel_types: string[];
  starting_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  hero_image_url?: string | null;
  body_type?: string | null;
  /** Present when the API tags the row (e.g. `car` vs `bike`) — used for compare rails. */
  vehicle_category?: string | null;
  [key: string]: unknown;
}

/** Normalised variant row from `/variants` and `/variants/{slug}`. */
export interface CatalogueVariant {
  id?: string;
  slug?: string;
  variant_name?: string;
  name?: string;
  brand_slug?: string;
  brand_name?: string;
  model_slug?: string;
  model_name?: string;
  fuel_type?: string;
  ex_showroom_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  features?: Record<string, Record<string, unknown>>;
  reviews?: unknown[];
  [key: string]: unknown;
}

export type SpecGroupRow = {
  group: string;
  specs: Array<{
    key: string;
    display_name: string;
    value: string;
  }>;
};

export type FeatureGroupRow = {
  group: string;
  features: Array<{
    key: string;
    display_name: string;
    value: Record<string, string>;
  }>;
};

/** Aggregated client payload for the model detail page. */
export type CatalogueModelDetailPayload = {
  brandSlug: string;
  modelSlug: string;
  listing: CatalogueModel;
  details: Record<string, unknown>;
  variants: CatalogueVariant[];
  modelImages: Record<string, unknown>[];
  modelColors: Record<string, unknown>[];
  specGroups: SpecGroupRow[];
  featureGroups: FeatureGroupRow[];
  reviews: Record<string, unknown>[];
};
