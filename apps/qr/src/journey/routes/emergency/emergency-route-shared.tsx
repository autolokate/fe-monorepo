import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import type { EmergencyApiError } from '@/services/emergency/emergency-api-errors';
import type { PurchaseCheckoutSession } from '../../../features/qr-purchase/types-checkout';
import type {
  EmergencyRiderPromptState,
  EmergencySession,
} from '../../../features/emergency/types';
import { resolveEmergencyFoundationContext } from '../../emergency/emergency-foundation';
import { emergencyJourneyPaths } from '../../emergency/emergency-routing';
import { useJourney } from '../../JourneyContext';

export function mapOtpErrorKind(error: EmergencyApiError): 'wrong' | 'expired' {
  if (error.code === 'unauthorized') {
    return 'expired';
  }
  return 'wrong';
}

export const VERIFY_OTP_SUCCESS_MS = 400;

export function EmergencySegmentBootstrap({ children }: { children: ReactNode }) {
  const { setPhase } = useJourney();

  useEffect(() => {
    setPhase('emergency');
  }, [setPhase]);

  return children;
}

export function useEmergencySession() {
  const { session, updateSession } = useJourney();
  const emergency = session.emergency ?? {};
  const emergencyRef = useRef(emergency);
  emergencyRef.current = emergency;

  const patchEmergency = useCallback(
    (patch: Partial<EmergencySession>) => {
      updateSession({
        emergency: {
          ...emergencyRef.current,
          ...patch,
        },
      });
    },
    [updateSession],
  );

  return { emergency, patchEmergency };
}

export function useEmergencyFoundation() {
  const { session, selectedFlow } = useJourney();
  return resolveEmergencyFoundationContext(session, selectedFlow);
}

export function useOnlineState() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function LegacyRiderSetupRedirect() {
  return <Navigate to={emergencyJourneyPaths.riderPrompt} replace />;
}

export function hasRiderEntitlementInPurchaseSession(
  purchase: PurchaseCheckoutSession | undefined,
): boolean {
  return purchase?.selectedPlanId !== undefined && purchase.riderCount !== undefined;
}

export function resolveR0InitialViewState(
  isOnline: boolean,
  loadFailed: boolean,
  purchase: PurchaseCheckoutSession | undefined,
): EmergencyRiderPromptState {
  if (!isOnline) {
    return 'offline';
  }
  if (loadFailed) {
    return 'error';
  }
  if (hasRiderEntitlementInPurchaseSession(purchase)) {
    return 'default';
  }
  return 'loading';
}

export const RIDER_SKIP_CONFIRM_TITLE = 'Continue without adding a rider?';
export const RIDER_SKIP_CONFIRM_BODY =
  'You can always add riders later from your vehicle profile. Adding a rider allows another trusted person to receive emergency alerts and access plan benefits.';
