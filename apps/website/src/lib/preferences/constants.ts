import type { VehicleCategory } from "./types";

/** localStorage key for the persisted vehicle-category preference. */
export const VEHICLE_PREFERENCE_STORAGE_KEY = "autolokate_vehicle_preference";

/** Custom DOM event fired when the vehicle preference is written or cleared. */
export const VEHICLE_PREFERENCE_CHANGE_EVENT =
  "autolokate:vehicle-preference-change";

/**
 * Category used whenever we need a preference but the user hasn't picked one
 * (e.g. while the multi-category prompt is disabled below).
 */
export const DEFAULT_VEHICLE_CATEGORY: VehicleCategory = "cars";

/**
 * Feature flag for the Cars/Bikes preference popup.
 *
 * The product currently ships only the Cars catalogue, so asking the visitor
 * to choose would be misleading. While this is `false`, click handlers
 * silently persist `DEFAULT_VEHICLE_CATEGORY` and skip the dialog. Flip to
 * `true` once Bikes (and any future categories) are live — no other code
 * change is required to bring the popup back.
 */
export const VEHICLE_CATEGORY_PROMPT_ENABLED = false;

export interface VehicleCategoryOption {
  value: VehicleCategory;
  label: string;
  description: string;
}

/** Source-of-truth for the radio options shown in the preference dialog. */
export const VEHICLE_CATEGORY_OPTIONS: readonly VehicleCategoryOption[] = [
  {
    value: "cars",
    label: "Cars",
    description: "Hatchbacks, Sedans, SUVs and more.",
  },
  {
    value: "bikes",
    label: "Bikes",
    description: "Scooters, Commuters and Superbikes.",
  },
] as const;
