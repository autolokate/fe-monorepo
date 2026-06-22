"use client";

import {
  VEHICLE_PREFERENCE_CHANGE_EVENT,
  VEHICLE_PREFERENCE_STORAGE_KEY,
} from "./constants";
import type { VehicleCategory } from "./types";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

/**
 * Notify in-tab listeners that the preference changed. The native `storage`
 * event only fires in other tabs, so we dispatch a custom event so the writing
 * tab can re-read its own value too.
 */
function notifyPreferenceChange(): void {
  if (!canUseStorage()) return;
  try {
    window.dispatchEvent(new CustomEvent(VEHICLE_PREFERENCE_CHANGE_EVENT));
  } catch {
    // Older webviews may lack CustomEvent; the storage event still works
    // across tabs which is the more important path.
  }
}

function isVehicleCategory(value: string | null): value is VehicleCategory {
  return value === "cars" || value === "bikes";
}

export function readVehiclePreference(): VehicleCategory | null {
  if (!canUseStorage()) return null;
  try {
    const value = localStorage.getItem(VEHICLE_PREFERENCE_STORAGE_KEY);
    return isVehicleCategory(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeVehiclePreference(value: VehicleCategory): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(VEHICLE_PREFERENCE_STORAGE_KEY, value);
    notifyPreferenceChange();
  } catch {
    // Storage quota / private mode — silent failure is acceptable here.
  }
}

export function clearVehiclePreference(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(VEHICLE_PREFERENCE_STORAGE_KEY);
    notifyPreferenceChange();
  } catch {
    // ignore
  }
}

/**
 * Subscribe to preference-change events from any source:
 *  - same tab: write/clear helpers dispatch a custom event
 *  - other tabs: localStorage `storage` event
 *
 * Returns an unsubscribe function for cleanup.
 */
export function subscribeVehiclePreference(handler: () => void): () => void {
  if (!canUseStorage()) return () => {};

  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key === VEHICLE_PREFERENCE_STORAGE_KEY) handler();
  };
  const onCustom = () => handler();

  window.addEventListener("storage", onStorage);
  window.addEventListener(VEHICLE_PREFERENCE_CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VEHICLE_PREFERENCE_CHANGE_EVENT, onCustom);
  };
}
