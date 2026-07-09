import type { NavigateFunction } from 'react-router-dom';

import type { PwaScanSession } from '@/features/post-activation-pwa/context/pwa-scan-types';
import type { QrResolution } from '@autolokate/api-client';

import { resetPurchaseCheckoutSession, selectActivationFlow } from '@/journey/navigation/select-activation-flow';
import type { ActivationFlowId, JourneyPhase, JourneySession } from '@/journey/types';
import { dispatchQrPayload, type QrDispatchDeps } from '@/platform/qr/dispatch-qr-payload';
import { extractQrCodeParam } from '@/platform/qr/parse-qr-url';
import type { QrDispatchError } from '@/platform/qr/qr-dispatch-contract';
import {
  isActivatedQrLifecycleStatus,
  isAttachedQrLifecycleStatus,
  isDistributedQrLifecycleStatus,
} from '@/platform/qr/qr-status';
import {
  PARTNER_JOURNEY_TARGET,
  resolvePartnerFlowId,
  resolvePartnerKindFromResolution,
  resolvePartnerVariantFromRiderCount,
  resolvePartnerWelcomePath,
  resolveQrJourneyTarget,
} from '@/journey/state/partner-journey-state-machine';
import { saveQrCode } from '@/storage/index';

import { mapResolutionToPayload } from './qr-mapper';
import { resolveQrCode } from './qr-service';
import { seedAttachedPurchaseFromResolve } from './seed-attached-purchase-from-resolve';
import {
  loadPartnerActivationPreviewAtEntry,
  seedPartnerActivationContext,
} from '@/services/activation/activation-service';
import { resolveB2bEntitlementCodeFromQrCode } from '@/services/activation/activation-mapper';

export type QrJourneyEntryPoint = 'auth-mobile' | 'scanner';

export type QrJourneyEntryDeps = {
  setSelectedFlow: (flow: ActivationFlowId) => void;
  setPhase: (phase: JourneyPhase) => void;
  navigate: NavigateFunction;
  updateSession?: (patch: Partial<JourneySession>) => void;
  updatePwaSession: (patch: Partial<PwaScanSession>) => void;
  /** Wipe persisted journey + API caches before routing a new QR code. */
  resetForNewQrEntry?: () => void;
};

export type QrJourneyEntryResult =
  | { ok: true; qrCode: string; purchaseSkipsVehicle: boolean }
  | { ok: false; error: QrDispatchError };

function dispatchDeps(deps: QrJourneyEntryDeps): QrDispatchDeps {
  return {
    setSelectedFlow: deps.setSelectedFlow,
    setPhase: deps.setPhase,
    navigate: deps.navigate,
    updateSession: deps.updateSession,
    updatePwaSession: deps.updatePwaSession,
  };
}

function shouldSkipFromResolution(resolution: QrResolution): boolean {
  return isAttachedQrLifecycleStatus(resolution.qrStatus);
}

function beginPurchaseJourney(
  code: string,
  deps: QrJourneyEntryDeps,
  entryPoint: QrJourneyEntryPoint,
  resolution: QrResolution,
): void {
  if (shouldSkipFromResolution(resolution)) {
    seedAttachedPurchaseFromResolve(code, resolution);
  }

  if (entryPoint === 'auth-mobile') {
    deps.setSelectedFlow('purchase');
    deps.setPhase('shared-auth');
    deps.updateSession?.(resetPurchaseCheckoutSession());
    return;
  }

  selectActivationFlow('purchase', deps);
}

async function beginPartnerActivationJourney(
  code: string,
  resolution: QrResolution,
  deps: QrJourneyEntryDeps,
): Promise<void> {
  const partnerKind = resolvePartnerKindFromResolution(resolution);
  if (!partnerKind) {
    return;
  }

  const entitlementCode =
    partnerKind === 'b2b'
      ? resolveB2bEntitlementCodeFromQrCode(code, resolution.offeredSku?.skuCode)
      : null;
  seedPartnerActivationContext({
    qrCode: code,
    entitlementCode,
    partnerKind,
  });

  const previewResult = await loadPartnerActivationPreviewAtEntry(code, partnerKind, entitlementCode);
  const riderCount: number = previewResult.ok ? previewResult.preview.riderCount : 0;
  const flowId = resolvePartnerFlowId(partnerKind);
  const variant = resolvePartnerVariantFromRiderCount(riderCount);
  const welcomePath = resolvePartnerWelcomePath(partnerKind, riderCount);

  deps.setSelectedFlow(flowId);
  deps.setPhase('flow-select');

  if (flowId === 'prepaid') {
    deps.updateSession?.({
      prepaid: {
        voucherId: entitlementCode ?? code,
        ...(previewResult.ok ? { entitlement: previewResult.entitlement } : {}),
      },
    });
  } else {
    deps.updateSession?.({
      b2b2c: {
        partnerId: code,
        variant,
        ...(previewResult.ok ? { entitlement: previewResult.entitlement } : {}),
      },
    });
  }

  void deps.navigate(welcomePath);
}

/**
 * Single QR entry path for scanner and auth-mobile `?qr_code=` URLs.
 * Resolves once, persists the response, then routes by journey target (state machine).
 */
export async function enterJourneyFromQrCode(
  code: string,
  deps: QrJourneyEntryDeps,
  options?: { entryPoint?: QrJourneyEntryPoint },
): Promise<QrJourneyEntryResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: { code: 'invalid', message: 'Missing QR code.' },
    };
  }

  const entryPoint = options?.entryPoint ?? 'auth-mobile';
  deps.resetForNewQrEntry?.();
  saveQrCode(trimmed);

  const result = await resolveQrCode(trimmed);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const { resolution } = result;
  const journeyTarget = resolveQrJourneyTarget(resolution);

  if (journeyTarget === PARTNER_JOURNEY_TARGET.POST_ACTIVATION) {
    const payload = mapResolutionToPayload(trimmed, resolution);
    if (payload?.type === 'activated') {
      dispatchQrPayload(payload, dispatchDeps(deps));
      return { ok: true, qrCode: trimmed, purchaseSkipsVehicle: false };
    }
  }

  if (isActivatedQrLifecycleStatus(resolution.qrStatus)) {
    return {
      ok: false,
      error: {
        code: 'invalid',
        message: 'This QR code is already activated but vehicle details are unavailable.',
      },
    };
  }

  if (journeyTarget === PARTNER_JOURNEY_TARGET.PURCHASE) {
    if (
      !isDistributedQrLifecycleStatus(resolution.qrStatus) &&
      !isAttachedQrLifecycleStatus(resolution.qrStatus)
    ) {
      return {
        ok: false,
        error: {
          code: 'invalid',
          message: 'This QR code is not ready for purchase activation.',
        },
      };
    }

    beginPurchaseJourney(trimmed, deps, entryPoint, resolution);
    return {
      ok: true,
      qrCode: trimmed,
      purchaseSkipsVehicle: isAttachedQrLifecycleStatus(resolution.qrStatus),
    };
  }

  if (
    journeyTarget === PARTNER_JOURNEY_TARGET.PARTNER_B2B2C ||
    journeyTarget === PARTNER_JOURNEY_TARGET.PARTNER_B2B
  ) {
    await beginPartnerActivationJourney(trimmed, resolution, deps);
    return { ok: true, qrCode: trimmed, purchaseSkipsVehicle: false };
  }

  return {
    ok: false,
    error: {
      code: 'invalid',
      message: 'This QR code cannot be used for activation.',
    },
  };
}

/** Read `qr_code` from URL params and run the unified QR entry flow. */
export async function enterJourneyFromQrSearchParams(
  searchParams: URLSearchParams,
  deps: QrJourneyEntryDeps,
  options?: { entryPoint?: QrJourneyEntryPoint },
): Promise<QrJourneyEntryResult | { ok: false; error: QrDispatchError }> {
  const code = extractQrCodeParam(searchParams);
  if (!code) {
    return {
      ok: false,
      error: { code: 'invalid', message: 'Missing QR entry parameters.' },
    };
  }
  return enterJourneyFromQrCode(code, deps, options);
}
