import type { VehicleLookupResult } from './vehicle-service.js';

const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  plate: string;
  result: VehicleLookupResult;
  expiresAt: number;
};

let cache: CacheEntry | null = null;
const inflight = new Map<string, Promise<VehicleLookupResult>>();

export function peekVehicleLookup(plate: string): VehicleLookupResult | null {
  if (!cache || cache.plate !== plate || cache.expiresAt <= Date.now()) {
    return null;
  }
  return cache.result;
}

export function rememberVehicleLookup(plate: string, result: VehicleLookupResult): void {
  cache = {
    plate,
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export function clearVehicleLookupCache(): void {
  cache = null;
}

export function getInflightLookup(plate: string): Promise<VehicleLookupResult> | null {
  return inflight.get(plate) ?? null;
}

export function setInflightLookup(plate: string, promise: Promise<VehicleLookupResult>): void {
  inflight.set(plate, promise);
}

export function clearInflightLookup(plate: string): void {
  inflight.delete(plate);
}
