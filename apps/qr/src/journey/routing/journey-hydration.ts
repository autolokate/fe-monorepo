import type { NavigateFunction } from 'react-router-dom';

import type { PwaScanSession } from '@/features/post-activation-pwa/context/pwa-scan-types';
import type { QrResolution } from '@autolokate/api-client';

import type { ActivationFlowId, JourneyPhase, JourneySession } from '@/journey/types';
import { saveResolvedQr } from '@/storage/index';
import { resolveQrJourneyTarget, PARTNER_JOURNEY_TARGET } from '@/journey/state/partner-journey-state-machine';
import { resolvePartnerFlowId, resolvePartnerKindFromResolution } from '@/journey/state/partner-journey-state-machine';
import { isAttachedQrLifecycleStatus } from '@/platform/qr/qr-status';
import { seedAttachedPurchaseFromResolve } from '@/services/qr/seed-attached-purchase-from-resolve';
import { resolveQrCode } from '@/services/qr/qr-service';

export type JourneyHydrationDeps = {
  setSelectedFlow: (flow: ActivationFlowId) => void;
  setPhase: (phase: JourneyPhase) => void;
  updateSession?: (patch: Partial<JourneySession>) => void;
  updatePwaSession?: (patch: Partial<PwaScanSession>) => void;
};

/** Hydrate journey context from API using the URL journey id — no localStorage reads. */
export async function hydrateJourneyFromUrl(
  journeyId: string,
  deps: JourneyHydrationDeps,
): Promise<{ ok: true; resolution: QrResolution } | { ok: false; message: string }> {
  const trimmed = journeyId.trim();
  if (!trimmed) {
    return { ok: false, message: 'Missing journey id.' };
  }

  const result = await resolveQrCode(trimmed);
  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  const { resolution } = result;
  saveResolvedQr(trimmed, resolution);
  const journeyTarget = resolveQrJourneyTarget(resolution);

  if (journeyTarget === PARTNER_JOURNEY_TARGET.PURCHASE) {
    deps.setSelectedFlow('purchase');
    deps.setPhase('shared-auth');
    if (isAttachedQrLifecycleStatus(resolution.qrStatus)) {
      seedAttachedPurchaseFromResolve(trimmed, resolution);
    }
    return { ok: true, resolution };
  }

  const partnerKind = resolvePartnerKindFromResolution(resolution);
  if (partnerKind) {
    const flowId = resolvePartnerFlowId(partnerKind);
    deps.setSelectedFlow(flowId);
    deps.setPhase('flow-select');
    return { ok: true, resolution };
  }

  return { ok: false, message: 'This QR code cannot be used for activation.' };
}

/** Redirect helper when legacy flat URL is opened without a journey id in the path. */
export function redirectToScopedPath(
  navigate: NavigateFunction,
  journeyId: string,
  suffix: string,
  search?: string,
): void {
  const base = `/onboarding/${encodeURIComponent(journeyId)}`;
  const path = suffix.startsWith('/') ? `${base}${suffix}` : `${base}/${suffix}`;
  void navigate(search ? { pathname: path, search } : path, { replace: true });
}
