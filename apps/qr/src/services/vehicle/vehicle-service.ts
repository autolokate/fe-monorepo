import { lookupVehicle as lookupVehicleApi } from '@autolokate/api-client';
import type { AlVehicleRcField } from '@autolokate/ui';

import { getQrApiClient } from '@/platform/api/qr-api-client';

import {
  clearInflightLookup,
  getInflightLookup,
  peekVehicleLookup,
  rememberVehicleLookup,
  setInflightLookup,
} from './vehicle-cache';
import { mapVehicleLookupApiError } from './vehicle-errors';
import { mapRcRecordToFields, mapRcRecordToVehicleSession } from './vehicle-mapper';
import { compactPlate, normalizePlate } from './vehicle-plate';
import { vehicleLogger } from './vehicle-logger';

export type VehicleLookupStatus = 'success' | 'not-found' | 'error';

export type VehicleLookupResult =
  | {
      status: 'success';
      plate: string;
      fields: AlVehicleRcField[];
    }
  | {
      status: 'not-found' | 'error';
      plate: string;
    };

function failure(status: 'not-found' | 'error', plate: string): VehicleLookupResult {
  return { status, plate };
}

async function fetchVehicleLookup(lookupKey: string, displayPlate: string): Promise<VehicleLookupResult> {
  try {
    const client = getQrApiClient();
    const record = await lookupVehicleApi(client, lookupKey);

    const mapped = mapRcRecordToVehicleSession(record);
    const fields = mapped.fields ?? mapRcRecordToFields(record);
    const result: VehicleLookupResult = {
      status: 'success',
      plate: mapped.plate || displayPlate,
      fields,
    };

    vehicleLogger.info('vehicle_lookup_success', { plate: lookupKey });
    rememberVehicleLookup(lookupKey, result);
    return result;
  } catch (error) {
    const status = mapVehicleLookupApiError(error);
    vehicleLogger.warn('vehicle_lookup_failed', { plate: lookupKey, status, error });
    const result = failure(status, displayPlate);
    if (status === 'not-found') {
      rememberVehicleLookup(lookupKey, result);
    }
    return result;
  }
}

/** Single entry point for Vahan RC lookup — purchase R04 and PWA park-me. */
export async function lookupVehicleByPlate(plate: string): Promise<VehicleLookupResult> {
  const displayPlate = normalizePlate(plate);
  const lookupKey = compactPlate(displayPlate);

  if (!lookupKey) {
    return failure('not-found', displayPlate);
  }

  const cached = peekVehicleLookup(lookupKey);
  if (cached) {
    vehicleLogger.debug('vehicle_lookup_cache_hit', { plate: lookupKey });
    return cached;
  }

  const inflight = getInflightLookup(lookupKey);
  if (inflight) {
    vehicleLogger.debug('vehicle_lookup_deduped', { plate: lookupKey });
    return inflight;
  }

  const promise = fetchVehicleLookup(lookupKey, displayPlate);
  setInflightLookup(lookupKey, promise);

  try {
    return await promise;
  } finally {
    clearInflightLookup(lookupKey);
  }
}

export { normalizePlate, compactPlate, isPlateEntryReady } from './vehicle-plate';
