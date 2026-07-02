import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRedeemActivation } from '@/hooks/activation/index.js';
import { reportUserError } from '@/platform/feedback/index.js';
import { getAuthFlowBackPath, getPostAuthActivationPath } from '../activation-routing.js';
import { resetPurchaseCheckoutSession } from '../navigation/select-activation-flow.js';
import { readPurchaseJourneyState } from '@/journey/state/purchase-journey-state-machine.js';
import { ensureAttachedPurchaseContext } from '@/services/qr/seed-attached-purchase-from-resolve.js';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository.js';
import { activationLogger } from '@/services/activation/activation-logger.js';
import { useJourney } from '../JourneyContext.js';
import { AuthRoutes } from './AuthRoutes.js';

export function JourneySharedAuthRoute() {
  const navigate = useNavigate();
  const { completeAuth, setPhase, selectedFlow, setSelectedFlow, session, updateSession } =
    useJourney();
  const { redeemActivation } = useRedeemActivation();

  const handleAuthCompleted = useCallback(async () => {
    const flow = selectedFlow ?? 'purchase';
    if (!selectedFlow) {
      setSelectedFlow('purchase');
    }
    completeAuth();

    if (flow === 'prepaid' || flow === 'b2b2c') {
      const redeemResult = await redeemActivation();
      if (!redeemResult.ok) {
        reportUserError(
          activationLogger,
          'activation_redeem_failed',
          redeemResult.error,
          redeemResult.error.message,
        );
        setPhase('flow-select');
        void navigate(getAuthFlowBackPath(flow));
        return;
      }
      setPhase('emergency');
      void navigate(getPostAuthActivationPath(flow, session));
      return;
    }

    const resolved = qrStorageRepository.readResolved();
    const journeyState = readPurchaseJourneyState();
    const attachedPatch =
      journeyState.skipsVehicleSteps && resolved
        ? ensureAttachedPurchaseContext(resolved)
        : {};

    updateSession({
      ...resetPurchaseCheckoutSession(),
      ...attachedPatch,
    });
    setPhase('activation');
    void navigate(getPostAuthActivationPath(flow, session));
  }, [
    completeAuth,
    navigate,
    redeemActivation,
    selectedFlow,
    session,
    setPhase,
    setSelectedFlow,
    updateSession,
  ]);

  return <AuthRoutes onAuthCompleted={handleAuthCompleted} />;
}

export { authJourneyPaths } from '../auth/auth-routing.js';
