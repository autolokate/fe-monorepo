import {
  shouldEnterEmergencyContacts,
  shouldEnterRiderPrompt,
} from '../features/emergency/emergency-limits';

import { buildAuthPaths } from './auth/auth-routing';
import { journeyPaths } from './constants';
import { buildEmergencyPaths } from './emergency/emergency-routing';
import { resolveEmergencyFoundationContext } from './emergency/emergency-foundation';
import {
  buildB2b2cPaths,
  buildPrepaidPaths,
  buildQrEntryPath,
  parseJourneyIdFromPathname,
} from './routing/journey-url-routing';
import { purchaseJourneyPathsFor } from './purchase/purchase-routing';
import { resolvePurchaseEntryPath } from '@/journey/state/purchase-journey-state-machine';
import type { ActivationFlowId, JourneySession } from './types';

/** First activation step after AUTH_COMPLETED. */
export type ActivationEntry = {
  stepId: string;
  path: string;
  label: string;
};

export function authCompletionEntry(journeyId: string): ActivationEntry {
  const paths = buildAuthPaths(journeyId);
  return {
    stepId: 'shared.vehicle-owner',
    path: paths.vehicleOwner,
    label: 'Vehicle owner · Auth completion destination',
  };
}

export function activationEntryByFlow(
  journeyId: string,
): Record<ActivationFlowId, ActivationEntry> {
  const purchase = purchaseJourneyPathsFor(journeyId);
  const prepaid = buildPrepaidPaths(journeyId);
  const b2b2c = buildB2b2cPaths(journeyId);
  return {
    purchase: {
      stepId: 'purchase.welcome',
      path: purchase.welcome,
      label: 'Purchase welcome · Activation preview',
    },
    prepaid: {
      stepId: 'prepaid.welcome',
      path: prepaid.welcome,
      label: 'Pre-paid welcome',
    },
    b2b2c: {
      stepId: 'b2b2c.welcome',
      path: b2b2c.welcome,
      label: 'Partner welcome',
    },
  };
}

export const EMERGENCY_SUFFIX_STEP_IDS = [
  'emergency.rider-prompt',
  'emergency.rider-mobile',
  'emergency.rider-otp',
  'emergency.rider-name',
  'emergency.riders-summary',
  'emergency.contacts-empty',
  'emergency.contact-mobile',
  'emergency.contact-otp',
  'emergency.contact-name',
  'emergency.contacts-summary',
] as const;

export type EmergencySuffixStepId = (typeof EMERGENCY_SUFFIX_STEP_IDS)[number];

export function emergencyEntry(journeyId: string): ActivationEntry {
  const paths = buildEmergencyPaths(journeyId);
  return {
    stepId: EMERGENCY_SUFFIX_STEP_IDS[0],
    path: paths.riderPrompt,
    label: 'Emergency + Rider entry',
  };
}

export function getActivationEntryPath(flow: ActivationFlowId, journeyId: string): string {
  return activationEntryByFlow(journeyId)[flow].path;
}

export function getPostAuthActivationPath(
  flow: ActivationFlowId | null,
  journeyIdOrSession?: string | JourneySession,
  session?: JourneySession,
): string {
  const journeyId =
    typeof journeyIdOrSession === 'string'
      ? journeyIdOrSession
      : ((typeof window !== 'undefined'
          ? parseJourneyIdFromPathname(window.location.pathname)
          : null) ?? '_');
  const resolvedSession = typeof journeyIdOrSession === 'object' ? journeyIdOrSession : session;

  if (!flow) {
    return purchaseJourneyPathsFor(journeyId).choosePlan;
  }

  if (flow === 'purchase') {
    return resolvePurchaseEntryPath(undefined, journeyId);
  }

  return getEmergencyHandoffPath(resolvedSession, flow, journeyId);
}

export function getActivationEntry(flow: ActivationFlowId, journeyId: string): ActivationEntry {
  return activationEntryByFlow(journeyId)[flow];
}

/** @deprecated Prefer getEmergencyHandoffPath — post-pay must still honor rider entitlement. */
export function getPurchasePostPaymentEmergencyPath(
  journeyId?: string,
  session?: Pick<JourneySession, 'purchase' | 'emergency'>,
  selectedFlow?: ActivationFlowId | null,
): string {
  if (session) {
    return getEmergencyHandoffPath(session, selectedFlow, journeyId);
  }
  const id =
    journeyId?.trim() ||
    (typeof window !== 'undefined' ? parseJourneyIdFromPathname(window.location.pathname) : null) ||
    '_';
  return buildEmergencyPaths(id).riderPrompt;
}

/**
 * Post-pay / post-attach destination:
 * 1) Rider screens when entitled and not skipped
 * 2) Emergency contacts when selected plan emergencyCount > 0 (min 1 required in UI)
 * 3) Completed otherwise
 *
 * Skipping riders must NOT skip emergency contacts.
 */
export function getEmergencyHandoffPath(
  session?: Pick<JourneySession, 'purchase' | 'emergency'>,
  selectedFlow?: ActivationFlowId | null,
  journeyId?: string,
): string {
  const id =
    journeyId?.trim() ||
    (typeof window !== 'undefined' ? parseJourneyIdFromPathname(window.location.pathname) : null);
  const paths = id ? buildEmergencyPaths(id) : null;
  const context = resolveEmergencyFoundationContext(session ?? {}, selectedFlow);
  const riderSkipped = Boolean(session?.emergency?.riderSkipped);

  if (
    !riderSkipped &&
    shouldEnterRiderPrompt(context.planId, context.riderCount, context.flowKind)
  ) {
    return paths?.riderPrompt ?? `${journeyPaths.emergency}/rider-prompt`;
  }

  if (shouldEnterEmergencyContacts(context.planId)) {
    return paths?.contactsEmpty ?? `${journeyPaths.emergency}/contacts-empty`;
  }

  return getCompletedPath();
}

export function getAuthFlowBackPath(flow: ActivationFlowId | null, journeyId?: string): string {
  const id =
    journeyId?.trim() ||
    (typeof window !== 'undefined' ? parseJourneyIdFromPathname(window.location.pathname) : null) ||
    '_';
  if (flow === 'prepaid') {
    return buildPrepaidPaths(id).welcome;
  }

  if (flow === 'b2b2c') {
    return buildB2b2cPaths(id).welcome;
  }

  if (flow === 'purchase') {
    return purchaseJourneyPathsFor(id).welcome;
  }

  return buildQrEntryPath(id);
}

export function getCompletedPath(): string {
  return journeyPaths.completed;
}

export function getEmergencyFlowBackPath(
  flow: ActivationFlowId | null,
  journeyIdOrSession?: string | Pick<JourneySession, 'purchase'>,
  session?: Pick<JourneySession, 'purchase'>,
): string {
  const journeyId =
    typeof journeyIdOrSession === 'string'
      ? journeyIdOrSession
      : ((typeof window !== 'undefined'
          ? parseJourneyIdFromPathname(window.location.pathname)
          : null) ?? '_');
  const resolvedSession = typeof journeyIdOrSession === 'object' ? journeyIdOrSession : session;
  if (flow === 'purchase') {
    return purchaseJourneyPathsFor(journeyId).paymentSuccess;
  }

  if (flow === 'prepaid') {
    return buildPrepaidPaths(journeyId).welcome;
  }

  if (flow === 'b2b2c') {
    const riderCount = resolvedSession?.purchase?.riderCount ?? 0;
    const b2b2c = buildB2b2cPaths(journeyId);
    return riderCount > 0 ? b2b2c.welcomePlanRider : b2b2c.welcome;
  }

  return buildQrEntryPath(journeyId);
}
