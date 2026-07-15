import {
  getEmergencyPlanLimits,
  resolvePurchasePlanId,
} from '@/features/emergency/emergency-limits';
import { getPurchasePlan } from '@/features/qr-purchase/data/purchase-plans';
import { AUTH_COMPLETED } from '@/features/shared-auth/types';
import type { JourneySession } from '../../types';

export type CompletionSummary = {
  planName: string;
  planActive: boolean;
  contactCount: number;
  contactsConfigured: boolean;
  protectionActive: boolean;
  plate?: string;
  ownerName?: string;
};

export function buildCompletionSummary(
  session: JourneySession,
  authStatus: typeof AUTH_COMPLETED | 'pending',
): CompletionSummary {
  const planId = resolvePurchasePlanId(session.purchase?.selectedPlanId);
  const plan = getPurchasePlan(planId);
  const limits = getEmergencyPlanLimits(planId);
  const contacts = session.emergency?.contacts ?? [];
  const planActive = authStatus === AUTH_COMPLETED && Boolean(session.purchase?.selectedPlanId);
  const contactsConfigured = contacts.length >= limits.minEmergencyContacts;

  return {
    planName: plan.name,
    planActive,
    contactCount: contacts.length,
    contactsConfigured,
    protectionActive: planActive && contactsConfigured,
    plate: session.vehicle?.plate,
    ownerName: session.auth?.ownerName,
  };
}
