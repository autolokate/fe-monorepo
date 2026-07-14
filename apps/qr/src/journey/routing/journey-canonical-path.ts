import { AUTH_COMPLETED } from '@/features/shared-auth/types';

import { hasAuthTokens } from '@/services/auth/ensure-valid-auth-session';
import { resolvePurchaseEntryPath } from '@/journey/state/purchase-journey-state-machine';
import type { ActivationFlowId, JourneySession, PersistedJourneyState } from '../types';
import { buildJourneyScopedPaths } from './journey-url-routing';
import { getEmergencyHandoffPath } from '../activation-routing';

export type CanonicalJourneyContext = Pick<
  PersistedJourneyState,
  'selectedFlow' | 'authStatus' | 'session'
> & {
  journeyId: string;
};

/**
 * Server/session-aware canonical URL for the user's current step.
 * Used for smart redirects when the URL is ahead or behind journey state.
 */
export function resolveJourneyCanonicalPath(context: CanonicalJourneyContext): string {
  const { journeyId, selectedFlow, authStatus, session } = context;
  const paths = buildJourneyScopedPaths(journeyId);

  if (!selectedFlow) {
    return paths.auth.mobile;
  }

  if (authStatus !== AUTH_COMPLETED && !hasAuthTokens()) {
    if (session.auth?.otpVerified) {
      return session.auth.isNewUser ? paths.auth.vehicleOwner : paths.auth.mobile;
    }
    if (session.auth?.mobile) {
      return paths.auth.otp;
    }
    return paths.auth.mobile;
  }

  if (authStatus !== AUTH_COMPLETED && hasAuthTokens() && session.auth?.isNewUser && !session.auth?.ownerName) {
    return paths.auth.vehicleOwner;
  }

  return resolveFlowCanonicalPath(selectedFlow, session, journeyId);
}

function resolveFlowCanonicalPath(
  flow: ActivationFlowId,
  session: JourneySession,
  journeyId: string,
): string {
  const paths = buildJourneyScopedPaths(journeyId);

  if (flow === 'prepaid') {
    return paths.prepaid.welcome;
  }

  if (flow === 'b2b2c') {
    const riderCount = session.purchase?.riderCount ?? 0;
    return riderCount > 0 ? paths.b2b2c.welcomePlanRider : paths.b2b2c.welcome;
  }

  return resolvePurchaseEntryPath(undefined, journeyId);
}

export function resolveJourneyResumePath(
  persisted: PersistedJourneyState,
  lastRoutePath: string | null,
  journeyId: string,
): string {
  if (lastRoutePath && lastRoutePath.includes(journeyId)) {
    return lastRoutePath;
  }

  return resolveJourneyCanonicalPath({
    journeyId,
    selectedFlow: persisted.selectedFlow,
    authStatus: persisted.authStatus,
    session: persisted.session,
  });
}

export function getEmergencyHandoffPathForJourney(
  session: JourneySession | undefined,
  selectedFlow: ActivationFlowId | null | undefined,
  journeyId: string,
): string {
  const paths = buildJourneyScopedPaths(journeyId);
  const handoff = getEmergencyHandoffPath(session, selectedFlow);
  const emergencyPaths = paths.emergency;

  const mapping: Record<string, string> = {
    '/emergency/rider-prompt': emergencyPaths.riderPrompt,
    '/emergency/contacts-empty': emergencyPaths.contactsEmpty,
  };

  return mapping[handoff] ?? emergencyPaths.contactsEmpty;
}
