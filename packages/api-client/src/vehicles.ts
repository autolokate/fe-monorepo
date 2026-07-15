import type { ApiClient } from './client';
import type { ApiPlanTier } from './plans';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** Vahan RC record returned by GET /v1/vehicles/lookup (no owner PII). */
export type RcRecordDto = {
  registration: string;
  make: string | null;
  model: string | null;
  year: number | null;
  fuel: string | null;
  insuranceStatus: string | null;
  pucStatus: string | null;
  rcValidTill: string | null;
};

export type VehicleSummaryDto = {
  subscriptionId: string;
  vehicleId: string;
  planTier: ApiPlanTier;
  status: 'ACTIVE' | 'LAPSED' | 'CANCELLED' | 'REFUNDED';
  plate: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  protection: 'PROTECTED' | 'EXPIRING' | 'UNPROTECTED' | null;
};

export type VehicleDetailDto = {
  vehicleId: string;
  plate: string;
  color: string | null;
  make: string | null;
  model: string | null;
  fuelType: 'PETROL' | 'DIESEL' | 'EV' | 'CNG' | null;
  year: number | null;
  rcValidTillLabel: string | null;
  protection: 'PROTECTED' | 'EXPIRING' | 'UNPROTECTED';
};

/** GET /v1/vehicles/lookup — Vahan RC lookup by normalized plate. */
export async function lookupVehicle(client: ApiClient, plate: string): Promise<RcRecordDto> {
  const query = new URLSearchParams({ plate });
  const response = await client.get<unknown>(`${endpoints.vehicles.lookup}?${query.toString()}`);
  return unwrapEnvelope(response) as RcRecordDto;
}

/** GET /v1/vehicles — list vehicles for the authenticated consumer. */
export async function listVehicles(client: ApiClient): Promise<VehicleSummaryDto[]> {
  const response = await client.get<unknown>(endpoints.vehicles.list);
  return unwrapEnvelope(response) as VehicleSummaryDto[];
}

/** GET /v1/vehicles/{id} — fetch a single vehicle by id. */
export async function getVehicleById(
  client: ApiClient,
  vehicleId: string,
): Promise<VehicleDetailDto> {
  const response = await client.get<unknown>(endpoints.vehicles.detail(vehicleId));
  return unwrapEnvelope(response) as VehicleDetailDto;
}
