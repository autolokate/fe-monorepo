import { clearJourneyPersistence } from '@/journey/persistence.js';
import { activationStorageRepository } from '@/platform/storage/repositories/activation-storage-repository.js';
import { emergencyContactStorageRepository } from '@/platform/storage/repositories/emergency-contact-storage-repository.js';
import { riderStorageRepository } from '@/platform/storage/repositories/rider-storage-repository.js';
import { clearLocalAuthSession } from '@/services/auth/auth-session.js';
import {
  clearActivationCache,
  clearActivationRedeemAttempt,
} from '@/services/activation/activation-cache.js';
import { clearCheckoutCache } from '@/services/checkout/checkout-cache.js';
import { resetEmergencyContactServiceState } from '@/services/emergency/emergency-contact-service.js';
import { resetPurchaseFlowState } from '@/services/purchase/reset-purchase-flow-state.js';
import { resetAttachAttemptCache } from '@/services/qr/qr-attach-service.js';
import { clearResolvedQrCache } from '@/services/qr/qr-cache.js';
import { resetRiderServiceState } from '@/services/rider/rider-service.js';
import { clearVehicleLookupCache } from '@/services/vehicle/vehicle-cache.js';

/**
 * Wipe onboarding journey blobs before a new QR activation.
 * Preserves UI prefs (theme, PWA install dismiss) — not journey data.
 */
export function resetOnboardingJourneyStorage(): void {
  clearLocalAuthSession();
  clearJourneyPersistence();
  resetPurchaseFlowState();
  emergencyContactStorageRepository.clear();
  riderStorageRepository.clear();
  activationStorageRepository.clear();
  clearActivationCache();
  clearActivationRedeemAttempt();
  resetEmergencyContactServiceState();
  resetRiderServiceState();
  resetAttachAttemptCache();
  clearResolvedQrCache();
  clearCheckoutCache();
  clearVehicleLookupCache();
}
