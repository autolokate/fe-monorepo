import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRedeemActivation } from '@/hooks/activation/index';
import { reportUserError } from '@/platform/feedback/index';
import { getAuthFlowBackPath, getPostAuthActivationPath } from '../activation-routing';
import { resetPurchaseCheckoutSession } from '../navigation/select-activation-flow';
import { readPurchaseJourneyState } from '@/journey/state/purchase-journey-state-machine';
import { ensureAttachedPurchaseContext } from '@/services/qr/seed-attached-purchase-from-resolve';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository';
import { activationLogger } from '@/services/activation/activation-logger';
import { useActiveJourneyId } from '../routing/use-active-journey-id';
import { useJourney } from '../JourneyContext';
import { AuthRoutes } from './AuthRoutes';

export function JourneySharedAuthRoute() {
  const navigate = useNavigate();
  const { completeAuth, setPhase, selectedFlow, setSelectedFlow, session, updateSession } =
    useJourney();
  const { redeemActivation } = useRedeemActivation();

  const journeyId = useActiveJourneyId();

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
        void navigate(getAuthFlowBackPath(flow, journeyId ?? undefined));
        return;
      }
      setPhase('emergency');
      void navigate(getPostAuthActivationPath(flow, journeyId ?? undefined, session), {
        replace: true,
      });
      return;
    }

    const resolved = qrStorageRepository.readResolved();
    const journeyState = readPurchaseJourneyState(undefined, journeyId);
    const attachedPatch =
      journeyState.skipsVehicleSteps && resolved
        ? ensureAttachedPurchaseContext(resolved)
        : {};

    updateSession({
      ...resetPurchaseCheckoutSession(),
      ...attachedPatch,
    });
    setPhase('activation');
    void navigate(getPostAuthActivationPath(flow, journeyId ?? undefined, session), {
      replace: true,
    });
  }, [
    completeAuth,
    journeyId,
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

export { authJourneyPaths } from '../auth/auth-routing';
