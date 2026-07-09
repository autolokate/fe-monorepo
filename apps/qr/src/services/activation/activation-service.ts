import type { ActivationPreviewDto, RedeemActivationBody } from '@autolokate/api-client';
import {
  previewActivation as previewActivationApi,
  redeemActivation as redeemActivationApi,
} from '@autolokate/api-client';

import type { LandingEntitlement } from '@/features/b2b-shared/types-landing';
import type { QrB2b2cPayload, QrPrepaidPayload } from '@/platform/qr/qr-dispatch-contract';
import type { PartnerActivationKind } from '@/platform/activation/activation-channel';
import {
  getQrApiClient,
  getQrBootstrapClient,
} from '@/platform/api/qr-api-client';
import { activationStorageRepository } from '@/platform/storage/repositories/activation-storage-repository';

import {
  clearActivationCache,
  clearActivationRedeemAttempt,
  getActivationRevision,
  getInflightPreview,
  getInflightRedeem,
  peekActivationCode,
  peekActivationLastError,
  peekActivationPreview,
  peekActivationQrCode,
  peekSubscriptionId,
  readActivationState,
  rememberActivationContext,
  setInflightPreview,
  setInflightRedeem,
  updateActivationState,
} from './activation-cache';
import { isActivationTransientError, mapActivationApiError, type ActivationError } from './activation-errors';
import {
  createActivationIdempotencyKey,
  mapPreviewToLandingEntitlement,
  resolveActivationPreviewCode,
  resolveB2bEntitlementCodeFromQrCode,
  resolveEntitlementCodeFromPayload,
  resolvePartnerKindFromFlow,
  type ActivationFlowKind,
} from './activation-mapper';
import { activationLogger } from './activation-logger';

const PREVIEW_MAX_ATTEMPTS = 3;
const PREVIEW_RETRY_BASE_MS = 400;
const REDEEM_MAX_ATTEMPTS = 2;
const REDEEM_RETRY_BASE_MS = 400;

export type LoadActivationPreviewResult =
  | { ok: true; entitlement: LandingEntitlement; preview: ActivationPreviewDto; revision: number }
  | { ok: false; error: ActivationError };

export type RedeemActivationResult =
  | { ok: true; subscriptionId: string; revision: number }
  | { ok: false; error: ActivationError };

let previewAbortController: AbortController | null = null;
let redeemAbortController: AbortController | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function activationFlowFromKind(kind: PartnerActivationKind): ActivationFlowKind {
  return kind === 'b2b' ? 'prepaid' : 'b2b2c';
}

function persistPreviewSnapshot(
  previewCode: string,
  preview: ActivationPreviewDto,
  entitlement: LandingEntitlement,
): void {
  activationStorageRepository.write({
    previewCode,
    preview,
    previewLoadedAt: new Date().toISOString(),
  });
  updateActivationState({
    preview: entitlement,
    lastErrorCode: null,
  });
}

export function seedPartnerActivationContext(params: {
  qrCode: string;
  entitlementCode: string | null;
  partnerKind: PartnerActivationKind;
}): void {
  const qrCode = params.qrCode.trim();
  const entitlementCode = params.entitlementCode?.trim() ?? null;
  const previewCode = resolveActivationPreviewCode({
    partnerKind: params.partnerKind,
    qrCode,
    entitlementCode,
  });

  activationStorageRepository.write({
    qrCode,
    entitlementCode,
    partnerKind: params.partnerKind,
    previewCode,
    preview: null,
    previewLoadedAt: null,
  });

  rememberActivationContext({
    activationCode: previewCode,
    qrCode,
  });
}

export function seedActivationFromQrPayload(
  qrCode: string,
  payload: QrPrepaidPayload | QrB2b2cPayload,
): void {
  seedPartnerActivationContext({
    qrCode,
    entitlementCode: resolveEntitlementCodeFromPayload(payload),
    partnerKind: payload.type === 'prepaid' ? 'b2b' : 'b2b2c',
  });
}

function readStoredPreviewEntitlement(
  previewCode: string,
): LoadActivationPreviewResult | null {
  const stored = activationStorageRepository.read();
  if (!stored?.preview || stored.previewCode !== previewCode.trim()) {
    return null;
  }

  const entitlement = mapPreviewToLandingEntitlement(stored.preview);
  updateActivationState({ preview: entitlement, lastErrorCode: null });
  return {
    ok: true,
    entitlement,
    preview: stored.preview,
    revision: getActivationRevision(),
  };
}

async function fetchPreviewWithRetry(
  code: string,
  flow: ActivationFlowKind,
): Promise<LoadActivationPreviewResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: { code: 'invalid', message: 'Missing activation code.' },
    };
  }

  rememberActivationContext({ activationCode: trimmed });

  previewAbortController?.abort();
  const abortController = new AbortController();
  previewAbortController = abortController;

  for (let attempt = 1; attempt <= PREVIEW_MAX_ATTEMPTS; attempt += 1) {
    if (abortController.signal.aborted) {
      return {
        ok: false,
        error: { code: 'invalid', message: 'Preview request was cancelled.' },
      };
    }

    try {
      const client = getQrBootstrapClient();
      const preview = await previewActivationApi(client, trimmed, {
        signal: abortController.signal,
      });
      const entitlement = mapPreviewToLandingEntitlement(preview);

      persistPreviewSnapshot(trimmed, preview, entitlement);
      activationStorageRepository.write({
        partnerKind: resolvePartnerKindFromFlow(flow),
      });

      activationLogger.info('preview_loaded', {
        flow,
        channel: preview.channel,
        planTier: preview.planTier,
        riderCount: preview.riderCount,
        paid: preview.paid,
      });

      return { ok: true, entitlement, preview, revision: getActivationRevision() };
    } catch (error) {
      if (isActivationTransientError(error) && attempt < PREVIEW_MAX_ATTEMPTS) {
        activationLogger.warn('preview_retry', { attempt, code: trimmed });
        await delay(PREVIEW_RETRY_BASE_MS * attempt);
        continue;
      }

      const mapped = mapActivationApiError(error);
      updateActivationState({ lastErrorCode: mapped.code });
      activationLogger.warn('preview_failed', { error: mapped });
      return { ok: false, error: mapped };
    }
  }

  return {
    ok: false,
    error: { code: 'unavailable', message: 'Unable to load activation preview.' },
  };
}

/** Load anonymous activation preview for welcome screens. */
export async function loadActivationPreview(
  code: string,
  flow: ActivationFlowKind,
): Promise<LoadActivationPreviewResult> {
  const trimmed = code.trim();
  const cached = readStoredPreviewEntitlement(trimmed);
  if (cached) {
    activationLogger.debug('preview_cache_hit', { code: trimmed });
    return cached;
  }

  const inflight = getInflightPreview();
  if (inflight) {
    return (await inflight) as LoadActivationPreviewResult;
  }

  const promise = fetchPreviewWithRetry(trimmed, flow);
  setInflightPreview(promise);

  try {
    return await promise;
  } finally {
    setInflightPreview(null);
  }
}

/** Load preview immediately after partner QR resolve — stored as single source of truth. */
export async function loadPartnerActivationPreviewAtEntry(
  qrCode: string,
  partnerKind: PartnerActivationKind,
  entitlementCode?: string | null,
): Promise<LoadActivationPreviewResult> {
  const resolvedEntitlement =
    partnerKind === 'b2b'
      ? (entitlementCode?.trim() ?? resolveB2bEntitlementCodeFromQrCode(qrCode) ?? null)
      : null;
  const previewCode = resolveActivationPreviewCode({
    partnerKind,
    qrCode,
    entitlementCode: resolvedEntitlement,
  });

  if (partnerKind === 'b2b' && resolvedEntitlement) {
    activationStorageRepository.write({
      entitlementCode: resolvedEntitlement,
      previewCode,
    });
  }

  return loadActivationPreview(previewCode, activationFlowFromKind(partnerKind));
}

export function readStoredActivationPreviewCode(): string | null {
  const stored = activationStorageRepository.read();
  if (!stored) {
    return null;
  }
  const previewCode = stored.previewCode.trim();
  if (previewCode) {
    return previewCode;
  }
  if (stored.partnerKind === 'b2b') {
    const entitlementCode = stored.entitlementCode?.trim();
    return entitlementCode || null;
  }
  const qrCode = stored.qrCode.trim();
  return qrCode || null;
}

function buildRedeemBody(
  partnerKind: PartnerActivationKind,
  qrCode: string,
  entitlementCode: string | null,
): RedeemActivationBody | null {
  if (partnerKind === 'b2b2c') {
    return { qrCode };
  }

  if (!entitlementCode?.trim()) {
    return null;
  }

  return { code: entitlementCode.trim(), qrCode };
}

async function redeemCurrentActivation(): Promise<RedeemActivationResult> {
  const stored = activationStorageRepository.read();
  const qrCode = (stored?.qrCode.trim() || peekActivationQrCode()?.trim()) ?? null;
  const partnerKind = stored?.partnerKind ?? 'b2b2c';
  const entitlementCode =
    stored?.entitlementCode?.trim() ?? peekActivationCode()?.trim() ?? null;

  if (!qrCode) {
    return {
      ok: false,
      error: { code: 'invalid', message: 'Missing QR code for redemption.' },
    };
  }

  const body = buildRedeemBody(partnerKind, qrCode, entitlementCode);
  if (!body) {
    return {
      ok: false,
      error: { code: 'invalid', message: 'Missing partner entitlement code.' },
    };
  }

  const current = readActivationState();
  const redeemIdempotencyKey =
    stored?.redeemIdempotencyKey ??
    current.redeemIdempotencyKey ??
    createActivationIdempotencyKey();

  activationStorageRepository.write({ redeemIdempotencyKey });
  updateActivationState({ redeemIdempotencyKey });

  redeemAbortController?.abort();
  const abortController = new AbortController();
  redeemAbortController = abortController;

  for (let attempt = 1; attempt <= REDEEM_MAX_ATTEMPTS; attempt += 1) {
    if (abortController.signal.aborted) {
      return {
        ok: false,
        error: { code: 'invalid', message: 'Redeem request was cancelled.' },
      };
    }

    try {
      const client = getQrApiClient();
      const redeemed = await redeemActivationApi(client, body, redeemIdempotencyKey, {
        signal: abortController.signal,
      });

      activationStorageRepository.write({ subscriptionId: redeemed.subscriptionId });
      updateActivationState({
        subscriptionId: redeemed.subscriptionId,
        lastErrorCode: null,
      });

      activationLogger.info('activation_redeemed', {
        subscriptionId: redeemed.subscriptionId,
        qrStatus: redeemed.qrStatus,
        partnerKind,
      });

      return {
        ok: true,
        subscriptionId: redeemed.subscriptionId,
        revision: getActivationRevision(),
      };
    } catch (error) {
      if (isActivationTransientError(error) && attempt < REDEEM_MAX_ATTEMPTS) {
        activationLogger.warn('activation_redeem_retry', { attempt, partnerKind });
        await delay(REDEEM_RETRY_BASE_MS * attempt);
        continue;
      }

      const mapped = mapActivationApiError(error);
      updateActivationState({ lastErrorCode: mapped.code });
      activationLogger.warn('activation_redeem_failed', { error: mapped, partnerKind });
      return { ok: false, error: mapped };
    }
  }

  return {
    ok: false,
    error: { code: 'unavailable', message: 'Unable to redeem activation.' },
  };
}

/** Redeem the cached entitlement after authentication. */
export async function redeemActivationEntitlement(): Promise<RedeemActivationResult> {
  const inflight = getInflightRedeem();
  if (inflight) {
    return (await inflight) as RedeemActivationResult;
  }

  const promise = redeemCurrentActivation();
  setInflightRedeem(promise);

  try {
    return await promise;
  } finally {
    setInflightRedeem(null);
  }
}

export function readStoredActivationPreview(): ActivationPreviewDto | null {
  return activationStorageRepository.read()?.preview ?? null;
}

export function readStoredActivationQrCode(): string | null {
  return activationStorageRepository.read()?.qrCode ?? peekActivationQrCode();
}

export {
  rememberActivationContext,
  clearActivationCache,
  clearActivationRedeemAttempt,
  getActivationRevision,
  peekActivationPreview,
  peekActivationCode,
  peekActivationQrCode,
  peekSubscriptionId,
  peekActivationLastError,
};
export type { ActivationFlowKind } from './activation-mapper';
