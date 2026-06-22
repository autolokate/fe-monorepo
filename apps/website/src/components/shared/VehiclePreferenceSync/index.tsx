"use client";

import { useSyncVehiclePreferenceFromProfile } from "@/hooks/preferences";

/**
 * Mount-only client component. Runs the profile → localStorage sync exactly
 * once at the root of the tree so any page can read
 * `autolokate_vehicle_preference` and get the freshest server value, and so
 * a logout clears the key automatically.
 */
export function VehiclePreferenceSync(): null {
  useSyncVehiclePreferenceFromProfile();
  return null;
}
