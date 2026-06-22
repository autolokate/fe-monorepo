/**
 * Canonical labels for advisor option ids — matches staging questionnaire copy
 * when `stepMap` no longer includes earlier steps (e.g. after completion).
 */
export const CANONICAL_ADVISOR_OPTION_LABELS: Record<string, string> = {
  // Budget
  budget_under_5: "Under 5 Lakhs",
  budget_5_8: "5 - 8 Lakhs",
  budget_8_12: "8 - 12 Lakhs",
  budget_12_20: "12 - 20 Lakhs",
  budget_20_35: "20 - 35 Lakhs",
  budget_35_plus: "35 Lakhs+",

  // Use case
  use_daily_commute: "Daily Commute",
  use_family_trips: "Family Trips",
  use_city_errands: "City Errands",
  use_highway: "Long Highway Drives",
  use_offroad: "Off-road / Adventure",

  // Family size
  family_1: "Just Me",
  family_2: "2 People",
  family_3_4: "3-4 (Small Family)",
  family_5_plus: "5+ (Large Family)",

  // Fuel (fuel_pref step)
  fuel_petrol: "Petrol",
  fuel_diesel: "Diesel",
  fuel_cng: "CNG",
  fuel_electric: "Electric",
  fuel_hybrid: "Hybrid",
  fuel_no_pref: "No Preference",

  // Must-haves / features
  feat_automatic: "Automatic Gears",
  feat_sunroof: "Sunroof",
  feat_mileage: "Great Mileage",
  feat_ground_clearance: "High Ground Clearance",
  feat_safety: "Safety (5-Star)",
  feat_boot_space: "Boot Space",
  feat_touchscreen: "Touchscreen with CarPlay",
  feat_ventilated_seats: "Ventilated Seats",
};
