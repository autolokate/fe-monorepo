"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearVehiclePreference,
  readVehiclePreference,
  subscribeVehiclePreference,
  writeVehiclePreference,
  type VehicleCategory,
} from "@/lib/preferences";

export interface UseVehiclePreferenceResult {
  /** Saved category, or `null` when no preference is stored yet. */
  value: VehicleCategory | null;
  /** Whether the hook has read localStorage at least once (SSR-safe). */
  hydrated: boolean;
  /** Persist a new preference. */
  set: (next: VehicleCategory) => void;
  /** Remove the stored preference. */
  clear: () => void;
}

/**
 * Reactive accessor for the visitor's vehicle-category preference. Hydrates
 * from localStorage on mount, then re-reads on cross-tab `storage` events and
 * same-tab custom events fired by `writeVehiclePreference`.
 */
export function useVehiclePreference(): UseVehiclePreferenceResult {
  const [value, setValue] = useState<VehicleCategory | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const read = () => setValue(readVehiclePreference());
    read();
    setHydrated(true);
    return subscribeVehiclePreference(read);
  }, []);

  const set = useCallback((next: VehicleCategory) => {
    writeVehiclePreference(next);
  }, []);

  const clear = useCallback(() => {
    clearVehiclePreference();
  }, []);

  return { value, hydrated, set, clear };
}
