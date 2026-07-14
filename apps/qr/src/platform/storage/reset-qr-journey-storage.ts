import { clearJourneyPersistence } from '@/journey/persistence';
import { activationStorageRepository } from '@/platform/storage/repositories/activation-storage-repository';
import { anonymousScannerRepository } from '@/platform/storage/repositories/anonymous-scanner-repository';
import { emergencyContactStorageRepository } from '@/platform/storage/repositories/emergency-contact-storage-repository';
import { riderStorageRepository } from '@/platform/storage/repositories/rider-storage-repository';
import {
  clearActivationCache,
  clearActivationRedeemAttempt,
} from '@/services/activation/activation-cache';
import { clearCheckoutCache } from '@/services/checkout/checkout-cache';
import { resetEmergencyContactServiceState } from '@/services/emergency/emergency-contact-service';
import { resetPurchaseFlowState } from '@/services/purchase/reset-purchase-flow-state';
import { clearQrCodeFromStorage } from '@/storage/index';
import { resetAttachAttemptCache } from '@/services/qr/qr-attach-service';
import { clearResolvedQrCache } from '@/services/qr/qr-cache';
import { resetRiderServiceState } from '@/services/rider/rider-service';
import {
  resetParkServiceState,
  resetScannerEmergencyServiceState,
} from '@/services/scanner/index';
import { clearVehicleLookupCache } from '@/services/vehicle/vehicle-cache';

/**
 * Wipe QR journey blobs before a new QR activation.
 * Preserves auth tokens and UI prefs (theme, PWA install dismiss).
 * Logout / clearJourney must clear tokens explicitly.
 */
export function resetQrJourneyStorage(): void {
  clearJourneyPersistence();
  clearQrCodeFromStorage();
  resetPurchaseFlowState();
  emergencyContactStorageRepository.clear();
  riderStorageRepository.clear();
  activationStorageRepository.clear();
  clearActivationCache();
  clearActivationRedeemAttempt();
  resetEmergencyContactServiceState();
  resetRiderServiceState();
  resetParkServiceState();
  resetScannerEmergencyServiceState();
  anonymousScannerRepository.clear();
  resetAttachAttemptCache();
  clearResolvedQrCache();
  clearCheckoutCache();
  clearVehicleLookupCache();
}
