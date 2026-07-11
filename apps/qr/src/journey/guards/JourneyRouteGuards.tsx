import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AUTH_COMPLETED } from '../../features/shared-auth/types';

import { authJourneyPaths } from '../auth/auth-routing';
import { getPostAuthActivationPath } from '../activation-routing';
import { hasAuthTokens } from '@/services/auth/ensure-valid-auth-session';
import { useJourney } from '../JourneyContext';
import type { ActivationFlowId } from '../types';

export type RequireSelectedFlowProps = {
  children: ReactNode;
  /** Where to send users who have not picked a flow yet. */
  fallbackPath?: string;
};

export function RequireSelectedFlow({
  children,
  fallbackPath,
}: RequireSelectedFlowProps) {
  const { selectedFlow, authStatus } = useJourney();

  if (!selectedFlow) {
    const redirect =
      authStatus === AUTH_COMPLETED || hasAuthTokens()
        ? (fallbackPath ?? getPostAuthActivationPath(null))
        : authJourneyPaths.mobile;
    return <Navigate to={redirect} replace />;
  }

  return children;
}

export type RequireAuthCompletedProps = {
  children: ReactNode;
};

/** Requires shared auth (Mobile → OTP → Vehicle owner) to be complete. */
export function RequireAuthCompleted({ children }: RequireAuthCompletedProps) {
  const { authStatus } = useJourney();
  const location = useLocation();

  if (authStatus !== AUTH_COMPLETED && !hasAuthTokens()) {
    return <Navigate to={authJourneyPaths.mobile} replace state={{ from: location.pathname }} />;
  }

  return children;
}

export type RequireSelectedFlowMatchProps = {
  flow: ActivationFlowId;
  children: ReactNode;
};

/** Ensures the active journey flow matches the route segment (e.g. purchase-only routes). */
export function RequireSelectedFlowMatch({ flow, children }: RequireSelectedFlowMatchProps) {
  const { selectedFlow, authStatus, session } = useJourney();

  if (!selectedFlow) {
    const redirect =
      authStatus === AUTH_COMPLETED || hasAuthTokens()
        ? getPostAuthActivationPath(null)
        : authJourneyPaths.mobile;
    return <Navigate to={redirect} replace />;
  }

  if (selectedFlow !== flow) {
    return <Navigate to={getPostAuthActivationPath(selectedFlow, session)} replace />;
  }

  return children;
}
