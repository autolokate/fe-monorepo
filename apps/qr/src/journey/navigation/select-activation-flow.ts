import type { NavigateFunction } from 'react-router-dom';

import { extractQrCodeParam } from '@/platform/qr/parse-qr-url.js';
import { saveQrCode } from '@/storage/index.js';

import { authJourneyPaths } from '../auth/auth-routing.js';
import { b2b2cJourneyPaths } from '../b2b2c/b2b2c-routing.js';
import { prepaidJourneyPaths } from '../prepaid/prepaid-routing.js';
import type { ActivationFlowId, JourneyPhase, JourneySession } from '../types.js';

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

/** Sets journey flow and navigates to the first screen of the selected path. */
export function selectActivationFlow(
  flow: ActivationFlowId,
  { setSelectedFlow, setPhase, navigate, updateSession }: SelectActivationFlowDeps,
): void {
  setSelectedFlow(flow);

  if (flow === 'purchase') {
    const codeFromUrl = extractQrCodeParam(new URLSearchParams(window.location.search));
    if (codeFromUrl) {
      saveQrCode(codeFromUrl);
    }
    updateSession?.(resetPurchaseCheckoutSession());
    setPhase('shared-auth');
    void navigate(authJourneyPaths.mobile);
    return;
  }

  if (flow === 'prepaid') {
    setPhase('flow-select');
    void navigate(prepaidJourneyPaths.welcome);
    return;
  }

  setPhase('flow-select');
  void navigate(b2b2cJourneyPaths.welcome);
}
