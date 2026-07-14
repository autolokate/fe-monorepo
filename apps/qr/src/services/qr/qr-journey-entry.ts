import type { NavigateFunction } from 'react-router-dom';

import type { PwaScanSession } from '@/features/post-activation-pwa/context/pwa-scan-types';
import type { QrResolution } from '@autolokate/api-client';

import { resetPurchaseCheckoutSession } from '@/journey/navigation/select-activation-flow';
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
import { commitResolvedQr, resolveQrCode } from './qr-service';
import { seedAttachedPurchaseFromResolve } from './seed-attached-purchase-from-resolve';
import {
  loadPartnerActivationPreviewAtEntry,
  loadPurchaseActivationPreviewAtEntry,
  seedPartnerActivationContext,
} from '@/services/activation/activation-service';
import { resolveB2bEntitlementCodeFromQrCode } from '@/services/activation/activation-mapper';
import { buildPurchasePaths } from '@/journey/routing/journey-url-routing';
import { applyLandingEntitlementToSession } from '@/features/b2b-shared/apply-landing-entitlement';

export type QrJourneyEntryPoint = 'auth-mobile' | 'scanner';

export type QrJourneyEntryOptions = {
  entryPoint?: QrJourneyEntryPoint;
  /**
   * Signed-in `/q` re-entry: still call resolve, but do not wipe session.
   * Only ACTIVATED starts a new journey; other statuses leave routing to the caller.
   */
  preserveSession?: boolean;
  /**
   * Always hit GET /resolve (skip session/memory peek). Used for `/q/:code` deep links.
   */
  forceNetwork?: boolean;
};

export type QrJourneyEntryOutcome = 'activated' | 'purchase' | 'partner' | 'unchanged';

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
  | {
      ok: true;
      qrCode: string;
      purchaseSkipsVehicle: boolean;
      staysOnAuthScreen: boolean;
      outcome: QrJourneyEntryOutcome;
    }
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

async function beginPurchaseJourney(
  code: string,
  deps: QrJourneyEntryDeps,
  resolution: QrResolution,
): Promise<void> {
  if (shouldSkipFromResolution(resolution)) {
    seedAttachedPurchaseFromResolve(code, resolution);
  }

  const previewResult = await loadPurchaseActivationPreviewAtEntry(code);
  const entitlementPatch = previewResult.ok
    ? {
        purchase: {
          ...resetPurchaseCheckoutSession().purchase,
          entitlement: previewResult.entitlement,
          selectedPlanId: previewResult.entitlement.planId,
          riderCount: previewResult.entitlement.riderCount,
        },
        ...applyLandingEntitlementToSession(previewResult.entitlement),
      }
    : resetPurchaseCheckoutSession();

  deps.setSelectedFlow('purchase');
  deps.updateSession?.(entitlementPatch);

  // Preview welcome is required before login (same pattern as B2B/B2B2C).
  // Signed-in users are bounced from welcome → plans by PurchaseWelcomeRoute.
  deps.setPhase('flow-select');
  void deps.navigate(buildPurchasePaths(code).welcome);
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
    partnerKind === 'b2b' ? resolveB2bEntitlementCodeFromQrCode(code) : null;
  seedPartnerActivationContext({
    qrCode: code,
    entitlementCode,
    partnerKind,
  });

  const previewResult = await loadPartnerActivationPreviewAtEntry(code, partnerKind, entitlementCode);
  const riderCount: number = previewResult.ok ? previewResult.preview.riderCount : 0;
  const flowId = resolvePartnerFlowId(partnerKind);
  const variant = resolvePartnerVariantFromRiderCount(riderCount);
  const welcomePath = resolvePartnerWelcomePath(partnerKind, riderCount, code);

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
  options?: QrJourneyEntryOptions,
): Promise<QrJourneyEntryResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: { code: 'invalid', message: 'Missing QR code.' },
    };
  }

  const preserveSession = options?.preserveSession === true;

  if (!preserveSession) {
    deps.resetForNewQrEntry?.();
    saveQrCode(trimmed);
  }

  // Signed-in `/q` re-entry: resolve without overwriting the active purchase QR
  // until ACTIVATED commits a new journey. forceNetwork only when the caller asks
  // (deep link) — auth re-entry must reuse cache or it will loop forever.
  const result = await resolveQrCode(trimmed, {
    commit: !preserveSession,
    forceNetwork: options?.forceNetwork === true,
  });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const { resolution } = result;
  const journeyTarget = resolveQrJourneyTarget(resolution);

  if (journeyTarget === PARTNER_JOURNEY_TARGET.POST_ACTIVATION) {
    const payload = mapResolutionToPayload(trimmed, resolution);
    if (payload?.type === 'activated') {
      if (preserveSession) {
        deps.resetForNewQrEntry?.();
        commitResolvedQr(trimmed, resolution);
      }
      dispatchQrPayload(payload, dispatchDeps(deps));
      return {
        ok: true,
        qrCode: trimmed,
        purchaseSkipsVehicle: false,
        staysOnAuthScreen: false,
        outcome: 'activated',
      };
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

  // Signed-in `/q` re-scan of a non-activated code: keep current journey UI.
  if (preserveSession) {
    return {
      ok: true,
      qrCode: trimmed,
      purchaseSkipsVehicle: isAttachedQrLifecycleStatus(resolution.qrStatus),
      staysOnAuthScreen: false,
      outcome: 'unchanged',
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

    await beginPurchaseJourney(trimmed, deps, resolution);
    return {
      ok: true,
      qrCode: trimmed,
      purchaseSkipsVehicle: isAttachedQrLifecycleStatus(resolution.qrStatus),
      staysOnAuthScreen: false,
      outcome: 'purchase',
    };
  }

  if (
    journeyTarget === PARTNER_JOURNEY_TARGET.PARTNER_B2B2C ||
    journeyTarget === PARTNER_JOURNEY_TARGET.PARTNER_B2B
  ) {
    await beginPartnerActivationJourney(trimmed, resolution, deps);
    return {
      ok: true,
      qrCode: trimmed,
      purchaseSkipsVehicle: false,
      staysOnAuthScreen: false,
      outcome: 'partner',
    };
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
  options?: QrJourneyEntryOptions,
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
