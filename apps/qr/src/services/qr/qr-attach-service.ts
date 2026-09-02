import { attachQr as attachQrApi } from '@autolokate/api-client';

import { getQrApiClient } from '@/platform/api/qr-api-client';
import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { isAttachedQrLifecycleStatus } from '@/platform/qr/qr-status';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository';
import { purchaseStorageRepository } from '@/platform/storage/repositories/purchase-storage-repository';
import { compactPlate } from '@/services/vehicle/vehicle-plate';
import { readPurchaseJourneyState } from '@/journey/state/purchase-journey-state-machine';

import { mapQrAttachApiError, type QrAttachError } from './qr-attach-errors';
import { qrAttachLogger } from './qr-attach-logger';

export type AttachPurchaseQrResult =
  | {
      ok: true;
      attachEventId: string;
      vehicleId: string;
      qrStatus: 'ATTACHED' | 'ACTIVATED';
      subscriptionId: string | null;
    }
  | { ok: false; error: QrAttachError };

let inflightAttach: Promise<AttachPurchaseQrResult> | null = null;
let lastAttachKey: string | null = null;
let lastAttachResult: AttachPurchaseQrResult | null = null;

/** Clear successful-result cache so a new plate can attach. Keeps in-flight coalescing intact. */
export function resetAttachAttemptCache(): void {
  lastAttachKey = null;
  lastAttachResult = null;
}

/** Drop in-flight + cache (logout / journey reset). */
export function clearAttachAttemptState(): void {
  inflightAttach = null;
  lastAttachKey = null;
  lastAttachResult = null;
}

function mapRegistrationForAttach(registration: string): string | null {
  const compact = compactPlate(registration);
  return compact.length >= 5 ? compact : null;
}

function successFromStoredAttach(
  attach: NonNullable<ReturnType<typeof purchaseStorageRepository.readAttachResult>>,
): AttachPurchaseQrResult {
  return {
    ok: true,
    attachEventId: attach.attachEventId,
    vehicleId: attach.vehicleId,
    qrStatus: attach.qrStatus,
    subscriptionId: attach.subscriptionId,
  };
}

/**
 * True when checkout may proceed.
 * ATTACHED resolve: attach API is not required.
 * DISTRIBUTED: POST /attach must have succeeded for the current QR + plate.
 */
export function isPurchaseAttachReady(searchParams?: URLSearchParams): boolean {
  const purchaseQrCode = resolvePurchaseQrCode(searchParams);
  if (!purchaseQrCode) {
    return false;
  }

  const resolved = qrStorageRepository.readResolved();
  if (
    resolved?.qrCode === purchaseQrCode &&
    isAttachedQrLifecycleStatus(resolved.qrStatus) &&
    resolved.vehicle?.plate
  ) {
    return true;
  }

  const registration = purchaseStorageRepository.readVehicle()?.registration;
  if (!registration) {
    return false;
  }

  const compactRegistration = mapRegistrationForAttach(registration);
  if (!compactRegistration) {
    return false;
  }

  const attach = purchaseStorageRepository.readAttachResult();
  if (!attach?.vehicleId || !attach.purchaseQrCode || !attach.registration) {
    return false;
  }

  return (
    attach.purchaseQrCode === purchaseQrCode &&
    compactPlate(attach.registration) === compactRegistration
  );
}

const MISSING_QR_MESSAGE =
  'Your purchase QR code is missing. Scan your Autolokate sticker or open your purchase link again.';

/**
 * POST /v1/qr/{code}/attach after vehicle confirm (R05), before plans.
 * Skipped entirely when resolve status is ATTACHED.
 * Pass `{ force: true }` from R05 so each "Looks right" hits the API (no memory cache).
 */
export async function attachPurchaseQr(
  searchParams?: URLSearchParams,
  options?: { force?: boolean },
): Promise<AttachPurchaseQrResult> {
  if (options?.force) {
    // Allow a fresh POST for a new plate, but do not cancel an identical in-flight request
    // (StrictMode / double-tap would otherwise fire attach twice).
    lastAttachResult = null;
  }

  if (readPurchaseJourneyState(searchParams).skipsAttachApi) {
    qrAttachLogger.info('attach_skipped', { reason: 'qr_already_attached' });
    return {
      ok: true,
      attachEventId: 'skipped-attached-resolve',
      vehicleId: purchaseStorageRepository.readAttachResult()?.vehicleId ?? 'attached-resolve',
      qrStatus: 'ATTACHED',
      subscriptionId: purchaseStorageRepository.readAttachResult()?.subscriptionId ?? null,
    };
  }

  const purchaseQrCode = resolvePurchaseQrCode(searchParams);
  const registration = purchaseStorageRepository.readVehicle()?.registration;
  const compactRegistration = registration ? mapRegistrationForAttach(registration) : null;

  if (!purchaseQrCode) {
    const storedAttach = purchaseStorageRepository.readAttachResult();
    if (
      !options?.force &&
      storedAttach?.purchaseQrCode &&
      compactRegistration &&
      compactPlate(storedAttach.registration) === compactRegistration
    ) {
      qrStorageRepository.writeCode(storedAttach.purchaseQrCode);
      qrAttachLogger.info('attach_reused', { reason: 'stored_attach_without_qr_code' });
      return successFromStoredAttach(storedAttach);
    }

    qrAttachLogger.warn('attach_skipped', { reason: 'missing_qr_code' });
    return {
      ok: false,
      error: {
        code: 'missing_qr_code',
        message: MISSING_QR_MESSAGE,
      },
    };
  }

  if (!registration || !compactRegistration) {
    qrAttachLogger.warn('attach_skipped', {
      reason: registration ? 'invalid_registration' : 'missing_registration',
      registration,
    });
    return {
      ok: false,
      error: {
        code: 'invalid',
        message: resolveUserFacingMessage(null, 'Missing vehicle registration.'),
      },
    };
  }

  const attachKey = `${purchaseQrCode}:${compactRegistration}`;
  if (!options?.force && lastAttachResult?.ok && lastAttachKey === attachKey) {
    return lastAttachResult;
  }

  if (inflightAttach && lastAttachKey === attachKey) {
    return inflightAttach;
  }

  lastAttachKey = attachKey;

  const promise = (async (): Promise<AttachPurchaseQrResult> => {
    try {
      const client = getQrApiClient();
      const result = await attachQrApi(client, purchaseQrCode, {
        registration: compactRegistration,
      });

      const success: AttachPurchaseQrResult = {
        ok: true,
        attachEventId: result.attachEventId,
        vehicleId: result.vehicleId,
        qrStatus: result.qrStatus,
        subscriptionId: result.subscriptionId,
      };

      purchaseStorageRepository.writeAttachResult({
        attachEventId: result.attachEventId,
        vehicleId: result.vehicleId,
        qrStatus: result.qrStatus,
        subscriptionId: result.subscriptionId,
        purchaseQrCode,
        registration,
      });

      lastAttachResult = success;
      qrAttachLogger.info('qr_attached', {
        qrCode: purchaseQrCode,
        vehicleId: result.vehicleId,
        qrStatus: result.qrStatus,
        attachEventId: result.attachEventId,
      });
      return success;
    } catch (error) {
      const mapped = mapQrAttachApiError(error);
      // already_attached / vehicle_already_subscribed must fail the journey so the
      // user can try another vehicle — do not treat as idempotent success.
      purchaseStorageRepository.clearAttachResult();
      lastAttachResult = null;
      qrAttachLogger.warn('qr_attach_failed', { qrCode: purchaseQrCode, error: mapped });
      return { ok: false, error: mapped };
    } finally {
      inflightAttach = null;
    }
  })();

  inflightAttach = promise;
  return promise;
}
