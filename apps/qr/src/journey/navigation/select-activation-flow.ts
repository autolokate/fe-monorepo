import type { NavigateFunction } from 'react-router-dom';

import { extractQrCodeParam } from '@/platform/qr/parse-qr-url';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { saveQrCode } from '@/storage/index';

import {
  buildB2b2cPaths,
  buildPrepaidPaths,
  buildPurchasePaths,
} from '../routing/journey-url-routing';
import type { ActivationFlowId, JourneyPhase, JourneySession } from '../types';

export type SelectActivationFlowDeps = {
  setSelectedFlow: (flow: ActivationFlowId) => void;
  setPhase: (phase: JourneyPhase) => void;
  navigate: NavigateFunction;
  updateSession?: (patch: Partial<JourneySession>) => void;
};

export function resetPurchaseCheckoutSession(): Partial<JourneySession> {
  return {
    purchase: {
      paymentStatus: 'idle',
      checkoutReady: false,
      promoCode: null,
      promoApplied: false,
      promoInvalid: false,
    },
  };
}

function resolveFlowJourneyId(): string | null {
  const fromUrl = extractQrCodeParam(new URLSearchParams(window.location.search));
  if (fromUrl) {
    saveQrCode(fromUrl);
    return fromUrl;
  }
  return resolvePurchaseQrCode(new URLSearchParams(window.location.search));
}

/** Sets journey flow and navigates to the first screen of the selected path. */
export function selectActivationFlow(
  flow: ActivationFlowId,
  { setSelectedFlow, setPhase, navigate, updateSession }: SelectActivationFlowDeps,
): void {
  setSelectedFlow(flow);
  const journeyId = resolveFlowJourneyId();

  if (flow === 'purchase') {
    updateSession?.(resetPurchaseCheckoutSession());
    setPhase('flow-select');
    if (journeyId) {
      void navigate(buildPurchasePaths(journeyId).welcome);
    }
    return;
  }

  if (flow === 'prepaid') {
    setPhase('flow-select');
    if (journeyId) {
      void navigate(buildPrepaidPaths(journeyId).welcome);
    }
    return;
  }

  setPhase('flow-select');
  if (journeyId) {
    void navigate(buildB2b2cPaths(journeyId).welcome);
  }
}
