import {
  createRider as createRiderApi,
  deleteRider as deleteRiderApi,
  listSubscriptionRiders as listSubscriptionRidersApi,
  requestRiderOtp as requestRiderOtpApi,
  toE164IndianMobile,
  verifyRiderOtp as verifyRiderOtpApi,
} from '@autolokate/api-client';

import type { EmergencyRider, RelationshipId } from '@/features/emergency/types.js';
import type { ActivationFlowId } from '@/journey/types.js';
import { getOnboardingApiClient } from '@/platform/api/onboarding-api-client.js';
import { riderStorageRepository } from '@/platform/storage/repositories/rider-storage-repository.js';
import {
  requireActiveSubscriptionIdAsync,
  type SubscriptionResolveError,
} from '@/services/subscription/resolve-subscription-id.js';
import { tryResolveSubscriptionFromVehicles } from '@/services/vehicle/vehicle-sync-service.js';

import {
  isEmergencyTransientError,
  mapEmergencyApiError,
  type EmergencyApiError,
} from '../emergency/emergency-api-errors.js';
import { mapApiRelationToLabel, mapRiderDtos } from './rider-mapper.js';
import { riderLogger } from './rider-logger.js';

const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 400;

export type RiderListResult =
  | { ok: true; riders: EmergencyRider[]; revision: number; subscriptionId: string }
  | { ok: false; error: EmergencyApiError | SubscriptionResolveError };

export type RiderOtpResult = { ok: true } | { ok: false; error: EmergencyApiError };

export type RiderVerifyResult =
  | { ok: true; verificationToken: string }
  | { ok: false; error: EmergencyApiError };

export type RiderCreateResult =
  | { ok: true; riders: EmergencyRider[]; revision: number }
  | { ok: false; error: EmergencyApiError | SubscriptionResolveError };

export type RiderDeleteResult =
  | { ok: true; riders: EmergencyRider[]; revision: number }
  | { ok: false; error: EmergencyApiError | SubscriptionResolveError };

let inflightList: Promise<RiderListResult> | null = null;
let inflightOtpRequest: Promise<RiderOtpResult> | null = null;
let inflightOtpVerify: Promise<RiderVerifyResult> | null = null;
let inflightCreate: Promise<RiderCreateResult> | null = null;
let listAbortController: AbortController | null = null;

/** Clear caches and in-flight requests — used when starting a new QR journey. */
export function resetRiderServiceState(): void {
  listAbortController?.abort();
  listAbortController = null;
  inflightList = null;
  inflightOtpRequest = null;
  inflightOtpVerify = null;
  inflightCreate = null;
  riderStorageRepository.clear();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function toE164(mobileDigits: string): string {
  return toE164IndianMobile(mobileDigits.replace(/\D/g, '').slice(-10));
}

function persistRiders(subscriptionId: string, riders: EmergencyRider[]): number {
  const state = riderStorageRepository.write({
    subscriptionId,
    riders,
    loadedAt: new Date().toISOString(),
  });
  return state.revision;
}

function maskPhoneDigits(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return last4.length === 4 ? `******${last4}` : mobile;
}

function buildOptimisticRider(
  riderId: string,
  name: string,
  relation: RelationshipId,
  phone: string | null,
): EmergencyRider {
  const phoneMasked = phone ? maskPhoneDigits(phone) : '';
  return {
    id: riderId,
    name: name.trim(),
    relation,
    mobile: phoneMasked,
    phoneMasked,
  };
}

function upsertRider(riders: EmergencyRider[], next: EmergencyRider): EmergencyRider[] {
  const index = riders.findIndex((rider) => rider.id === next.id);
  if (index >= 0) {
    return riders.map((rider, riderIndex) => (riderIndex === index ? next : rider));
  }
  return [...riders, next];
}

/** GET /v1/subscriptions/:subscriptionId/riders */
export async function loadSubscriptionRiders(
  selectedFlow: ActivationFlowId | null,
  options?: { force?: boolean },
): Promise<RiderListResult> {
  const resolved = await requireActiveSubscriptionIdAsync(selectedFlow);
  if (!resolved.ok) {
    return { ok: false, error: resolved.error };
  }

  const { subscriptionId } = resolved;
  const stored = riderStorageRepository.read();
  if (
    !options?.force &&
    stored.subscriptionId === subscriptionId &&
    stored.loadedAt
  ) {
    return {
      ok: true,
      riders: stored.riders,
      revision: stored.revision,
      subscriptionId,
    };
  }

  if (inflightList) {
    return inflightList;
  }

  listAbortController?.abort();
  const abortController = new AbortController();
  listAbortController = abortController;

  const promise = (async (): Promise<RiderListResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getOnboardingApiClient();
        const dtos = await listSubscriptionRidersApi(client, subscriptionId, {
          signal: abortController.signal,
        });
        const riders = mapRiderDtos(dtos);
        const revision = persistRiders(subscriptionId, riders);
        riderLogger.info('riders_loaded', { count: riders.length, subscriptionId });
        return { ok: true, riders, revision, subscriptionId };
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        riderLogger.warn('riders_load_failed', { error: mapped, subscriptionId });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to load riders.', apiMessage: null },
    };
  })();

  inflightList = promise;
  try {
    return await promise;
  } finally {
    inflightList = null;
  }
}

/** POST /v1/riders/otp/request */
export async function requestRiderOtp(mobileDigits: string): Promise<RiderOtpResult> {
  if (inflightOtpRequest) {
    return inflightOtpRequest;
  }

  const phone = toE164(mobileDigits);
  const promise = (async (): Promise<RiderOtpResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getOnboardingApiClient();
        await requestRiderOtpApi(client, { phone });
        riderStorageRepository.write({ verificationPhone: phone });
        riderLogger.info('rider_otp_requested');
        return { ok: true };
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        riderLogger.warn('rider_otp_request_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to send verification code.', apiMessage: null },
    };
  })();

  inflightOtpRequest = promise;
  try {
    return await promise;
  } finally {
    inflightOtpRequest = null;
  }
}

/** POST /v1/riders/otp/verify */
export async function verifyRiderOtp(
  mobileDigits: string,
  code: string,
): Promise<RiderVerifyResult> {
  if (inflightOtpVerify) {
    return inflightOtpVerify;
  }

  const phone = toE164(mobileDigits);
  const promise = (async (): Promise<RiderVerifyResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getOnboardingApiClient();
        const result = await verifyRiderOtpApi(client, { phone, code });
        riderStorageRepository.write({
          verificationToken: result.verificationToken,
          verificationPhone: phone,
        });
        riderLogger.info('rider_otp_verified');
        return { ok: true, verificationToken: result.verificationToken };
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        riderLogger.warn('rider_otp_verify_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to verify code.', apiMessage: null },
    };
  })();

  inflightOtpVerify = promise;
  try {
    return await promise;
  } finally {
    inflightOtpVerify = null;
  }
}

/** POST /v1/riders — then refresh list. */
export async function createRider(
  selectedFlow: ActivationFlowId | null,
  name: string,
  relation: RelationshipId,
  verificationToken?: string,
): Promise<RiderCreateResult> {
  if (inflightCreate) {
    return inflightCreate;
  }

  let resolved = await requireActiveSubscriptionIdAsync(selectedFlow);
  if (!resolved.ok) {
    await tryResolveSubscriptionFromVehicles();
    resolved = await requireActiveSubscriptionIdAsync(selectedFlow);
  }
  if (!resolved.ok) {
    return { ok: false, error: resolved.error };
  }

  const token = verificationToken ?? riderStorageRepository.read().verificationToken ?? null;
  const verificationPhone = riderStorageRepository.read().verificationPhone;
  if (!token) {
    return {
      ok: false,
      error: { code: 'validation', message: 'Verification expired. Request a new code.', apiMessage: null },
    };
  }

  const promise = (async (): Promise<RiderCreateResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getOnboardingApiClient();
        const created = await createRiderApi(client, {
          verificationToken: token,
          subscriptionId: resolved.subscriptionId,
          name: name.trim(),
          relation: mapApiRelationToLabel(relation),
        });
        riderStorageRepository.clearVerification();
        const refreshed = await loadSubscriptionRiders(selectedFlow, { force: true });
        if (refreshed.ok) {
          riderLogger.info('rider_created', { subscriptionId: resolved.subscriptionId });
          return { ok: true, riders: refreshed.riders, revision: refreshed.revision };
        }
        const storedRiders = riderStorageRepository.read().riders;
        const optimistic = buildOptimisticRider(
          created.riderId,
          name,
          relation,
          verificationPhone,
        );
        const riders = upsertRider(storedRiders, optimistic);
        const revision = persistRiders(resolved.subscriptionId, riders);
        riderLogger.warn('rider_create_refresh_failed_using_optimistic', {
          riderId: created.riderId,
          refreshError: refreshed.error,
        });
        return { ok: true, riders, revision };
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        riderLogger.warn('rider_create_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to add rider.', apiMessage: null },
    };
  })();

  inflightCreate = promise;
  try {
    return await promise;
  } finally {
    inflightCreate = null;
  }
}

/** DELETE /v1/riders/:id — then refresh list. */
export async function deleteRider(
  selectedFlow: ActivationFlowId | null,
  riderId: string,
): Promise<RiderDeleteResult> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const client = getOnboardingApiClient();
      await deleteRiderApi(client, riderId);
      const refreshed = await loadSubscriptionRiders(selectedFlow, { force: true });
      if (!refreshed.ok) {
        return refreshed;
      }
      riderLogger.info('rider_deleted', { riderId });
      return { ok: true, riders: refreshed.riders, revision: refreshed.revision };
    } catch (error) {
      if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
        await delay(RETRY_BASE_MS * attempt);
        continue;
      }
      const mapped = mapEmergencyApiError(error);
      riderLogger.warn('rider_delete_failed', { error: mapped });
      return { ok: false, error: mapped };
    }
  }
  return {
    ok: false,
    error: { code: 'unavailable', message: 'Unable to remove rider.', apiMessage: null },
  };
}

export function peekStoredRiders(): EmergencyRider[] {
  return riderStorageRepository.read().riders;
}

export function getRidersRevision(): number {
  return riderStorageRepository.read().revision;
}
