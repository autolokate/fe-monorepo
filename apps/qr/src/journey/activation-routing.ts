import { shouldEnterRiderPrompt } from '../features/emergency/emergency-limits';

import { authJourneyPaths, defaultActivationAfterAuth } from './auth/auth-routing';
import { journeyPaths } from './constants';
import { emergencyJourneyPaths } from './emergency/emergency-routing';
import { resolveEmergencyFoundationContext } from './emergency/emergency-foundation';
import { b2b2cJourneyPaths } from './b2b2c/b2b2c-routing';
import { prepaidJourneyPaths } from './prepaid/prepaid-routing';
import { purchaseJourneyPaths } from './purchase/purchase-routing';
import { resolvePurchaseEntryPath } from '@/journey/state/purchase-journey-state-machine';
import type { ActivationFlowId, JourneySession } from './types';

/** First activation step after AUTH_COMPLETED. */
export type ActivationEntry = {
  stepId: string;
  path: string;
  label: string;
};

/** Auth completion lands on vehicle owner (174:25) — not activation. */
export const authCompletionEntry: ActivationEntry = {
  stepId: 'shared.vehicle-owner',
  path: authJourneyPaths.vehicleOwner,
  label: 'Vehicle owner · Auth completion destination',
};

export const activationEntryByFlow: Record<ActivationFlowId, ActivationEntry> = {
  purchase: {
    stepId: 'purchase.vehicle-number',
    path: purchaseJourneyPaths.vehicleDetails,
    label: 'Vehicle number · Purchase activation entry',
  },
  prepaid: {
    stepId: 'prepaid.welcome',
    path: prepaidJourneyPaths.welcome,
    label: 'Pre-paid welcome',
  },
  b2b2c: {
    stepId: 'b2b2c.welcome',
    path: b2b2cJourneyPaths.welcome,
    label: 'Partner welcome',
  },
};

/** Emergency suffix — Figma-aligned (Phase 11b). */
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

export const emergencyEntry: ActivationEntry = {
  stepId: EMERGENCY_SUFFIX_STEP_IDS[0],
  path: `${journeyPaths.emergency}/rider-prompt`,
  label: 'Emergency + Rider entry',
};

export function getActivationEntryPath(flow: ActivationFlowId): string {
  return activationEntryByFlow[flow].path;
}

export function getPostAuthActivationPath(
  flow: ActivationFlowId | null,
  session?: JourneySession,
): string {
  if (!flow) {
    return defaultActivationAfterAuth;
  }

  if (flow === 'purchase') {
    return resolvePurchaseEntryPath();
  }

  return getEmergencyHandoffPath(session, flow);
}

export function getActivationEntry(flow: ActivationFlowId): ActivationEntry {
  return activationEntryByFlow[flow];
}

/**
 * First emergency route after purchase payment success (R10 Continue).
 * All plans land on contacts-empty — rider flow is optional later, not entry.
 */
export function getPurchasePostPaymentEmergencyPath(): string {
  return emergencyJourneyPaths.contactsEmpty;
}

/**
 * First emergency route after activation (prepaid/B2B2C) or legacy handoff.
 * No rider entitlement (Safe or riderCount 0) → E0; addon entitled → R0.
 */
export function getEmergencyHandoffPath(
  session?: Pick<JourneySession, 'purchase'>,
  selectedFlow?: ActivationFlowId | null,
): string {
  const context = resolveEmergencyFoundationContext(session ?? {}, selectedFlow);

  if (!shouldEnterRiderPrompt(context.planId, context.riderCount, context.flowKind)) {
    return emergencyJourneyPaths.contactsEmpty;
  }

  return emergencyJourneyPaths.riderPrompt;
}

export function getAuthFlowBackPath(flow: ActivationFlowId | null): string {
  if (flow === 'prepaid') {
    return prepaidJourneyPaths.welcome;
  }

  if (flow === 'b2b2c') {
    return b2b2cJourneyPaths.welcome;
  }

  return journeyPaths.root;
}

export function getCompletedPath(): string {
  return journeyPaths.completed;
}

/** Emergency back-nav target — stays inside the active flow (not purchase R10 for prepaid/B2B2C). */
export function getEmergencyFlowBackPath(
  flow: ActivationFlowId | null,
  session?: Pick<JourneySession, 'purchase'>,
): string {
  if (flow === 'purchase') {
    return purchaseJourneyPaths.paymentSuccess;
  }

  if (flow === 'prepaid') {
    return prepaidJourneyPaths.welcome;
  }

  if (flow === 'b2b2c') {
    const riderCount = session?.purchase?.riderCount ?? 0;
    return riderCount > 0 ? b2b2cJourneyPaths.welcomePlanRider : b2b2cJourneyPaths.welcome;
  }

  return journeyPaths.root;
}
