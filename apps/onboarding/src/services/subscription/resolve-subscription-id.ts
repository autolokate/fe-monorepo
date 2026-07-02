import type { ActivationFlowId } from '@/journey/types.js';
import { activationStorageRepository } from '@/platform/storage/repositories/activation-storage-repository.js';
import { purchaseStorageRepository } from '@/platform/storage/repositories/purchase-storage-repository.js';
import { peekSubscriptionId } from '@/services/activation/activation-service.js';
import { tryResolveSubscriptionFromVehicles } from '@/services/vehicle/vehicle-sync-service.js';

export type SubscriptionResolveError = {
  code: 'missing';
  message: string;
};

/** Resolve subscriptionId from stored attach/redeem — never guess. */
export function resolveActiveSubscriptionId(
  selectedFlow: ActivationFlowId | null,
): string | null {
  if (selectedFlow === 'purchase') {
    return purchaseStorageRepository.readAttachResult()?.subscriptionId?.trim() ?? null;
  }

  if (selectedFlow === 'prepaid' || selectedFlow === 'b2b2c') {
    const stored = activationStorageRepository.read()?.subscriptionId?.trim();
    if (stored) {
      return stored;
    }
    return peekSubscriptionId()?.trim() ?? null;
  }

  return (
    activationStorageRepository.read()?.subscriptionId?.trim() ??
    purchaseStorageRepository.readAttachResult()?.subscriptionId?.trim() ??
    peekSubscriptionId()?.trim() ??
    null
  );
}

/** Resolve subscriptionId from stored attach/redeem — never guess. */
export async function resolveActiveSubscriptionIdAsync(
  selectedFlow: ActivationFlowId | null,
): Promise<string | null> {
  const existing = resolveActiveSubscriptionId(selectedFlow);
  if (existing || selectedFlow !== 'purchase') {
    return existing;
  }

  return tryResolveSubscriptionFromVehicles();
}

export function requireActiveSubscriptionId(
  selectedFlow: ActivationFlowId | null,
): { ok: true; subscriptionId: string } | { ok: false; error: SubscriptionResolveError } {
  const subscriptionId = resolveActiveSubscriptionId(selectedFlow);
  if (!subscriptionId) {
    return {
      ok: false,
      error: {
        code: 'missing',
        message: 'Subscription is not available yet. Complete activation and try again.',
      },
    };
  }
  return { ok: true, subscriptionId };
}

export async function requireActiveSubscriptionIdAsync(
  selectedFlow: ActivationFlowId | null,
): Promise<{ ok: true; subscriptionId: string } | { ok: false; error: SubscriptionResolveError }> {
  const subscriptionId = await resolveActiveSubscriptionIdAsync(selectedFlow);
  if (!subscriptionId) {
    return {
      ok: false,
      error: {
        code: 'missing',
        message: 'Subscription is not available yet. Complete activation and try again.',
      },
    };
  }
  return { ok: true, subscriptionId };
}
