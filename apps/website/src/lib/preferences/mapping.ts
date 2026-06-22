import {
  clearVehiclePreference,
  writeVehiclePreference,
} from "./storage";
import type { VehicleCategory } from "./types";

/**
 * Translate the API's `preferred_vehicle_category` value into our internal
 * `VehicleCategory` union.
 *
 * API taxonomy (singular): "car" | "bike" | "scooter".
 * UI  taxonomy (plural):   "cars" | "bikes".
 *
 * Two-wheelers ("bike", "scooter") collapse to `"bikes"` since the storefront
 * groups them under a single category today. Unknown or empty values return
 * `null` so callers can leave any existing local preference untouched.
 */
export function fromApiVehicleCategory(
  value: string | null | undefined,
): VehicleCategory | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "car" || normalized === "cars") return "cars";
  if (
    normalized === "bike" ||
    normalized === "bikes" ||
    normalized === "scooter" ||
    normalized === "scooters"
  ) {
    return "bikes";
  }
  return null;
}

/**
 * Translate an internal `VehicleCategory` back to the API's singular form so
 * it can be sent in profile updates without a separate switch on the caller.
 */
export function toApiVehicleCategory(value: VehicleCategory): "car" | "bike" {
  return value === "cars" ? "car" : "bike";
}

/**
 * Reconcile an API-shaped category value into localStorage:
 *  - `null` or `""`              → clear the local preference (user cleared
 *                                  the field server-side).
 *  - Recognised category string  → write the mapped UI value.
 *  - Unrecognised / `undefined`  → leave the existing local value alone.
 *
 * Use this from any flow that receives a fresh `/v1/auth/me` payload (login
 * sync, profile-update success handler, etc.) so all those call sites apply
 * the same rule.
 */
export function applyApiVehicleCategoryToStorage(
  value: string | null | undefined,
): void {
  if (value === null) {
    clearVehiclePreference();
    return;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      clearVehiclePreference();
      return;
    }
    const mapped = fromApiVehicleCategory(trimmed);
    if (mapped) writeVehiclePreference(mapped);
  }
}
