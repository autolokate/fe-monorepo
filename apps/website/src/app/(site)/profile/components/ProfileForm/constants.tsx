import { VEHICLE_CATEGORIES, type ProfileFormFields } from "@/lib/profile/validation";

export { VEHICLE_CATEGORIES };

export const LABEL = "text-sm font-semibold tracking-tight text-foreground";

export const FIELD_ERROR_BORDER = "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30";

/** Initial blank state — kept for tests or future use. */
export const EMPTY_FORM: ProfileFormFields = {
  full_name: "",
  phone: "",
  city_id: "",
  budget_min: "",
  budget_max: "",
  preferred_fuel_types: "",
  preferred_body_types: "",
  preferred_vehicle_category: "",
};
