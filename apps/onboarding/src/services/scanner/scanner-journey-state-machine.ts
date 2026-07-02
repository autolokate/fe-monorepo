import type { AlertStatus, ParkStatus } from '@autolokate/api-client';

import { pwaScanPaths } from '@/features/post-activation-pwa/constants/pwa-scan-paths.js';
import type { PwaParkMeStatus, PwaSosStatus } from '@/features/post-activation-pwa/context/pwa-scan-types.js';

export type ScannerJourneyPhase =
  | 'idle'
  | 'park-otp'
  | 'park-lookup'
  | 'park-upload'
  | 'park-tracker'
  | 'emergency-upload'
  | 'emergency-tracker';

export function mapParkApiStatusToSession(status: ParkStatus): PwaParkMeStatus {
  switch (status) {
    case 'CHECKING':
      return 'checking';
    case 'CALLING':
      return 'calling';
    case 'RESOLVED':
      return 'resolved';
    case 'PHOTO_INVALID':
      return 'photo-error';
    case 'EXPIRED':
      return 'resolved';
    default:
      return 'checking';
  }
}

export function mapParkApiStatusToPath(status: ParkStatus): string {
  switch (status) {
    case 'CHECKING':
      return pwaScanPaths.parkMeStatusChecking;
    case 'CALLING':
      return pwaScanPaths.parkMeStatusCalling;
    case 'RESOLVED':
    case 'EXPIRED':
      return pwaScanPaths.parkMeStatusResolved;
    case 'PHOTO_INVALID':
      return pwaScanPaths.parkMePhotoNotClear;
    default:
      return pwaScanPaths.parkMeStatusChecking;
  }
}

export function mapEmergencyApiStatusToSession(status: AlertStatus): PwaSosStatus {
  switch (status) {
    case 'RECEIVED':
      return 'help-received';
    case 'DISPATCHED':
      return 'dispatched';
    case 'RESOLVED':
      return 'resolved';
    case 'CANCELLED':
      return 'cancelled';
    case 'CONTACTS_ONLY':
      return 'contacts-only';
    default:
      return 'help-received';
  }
}

export function mapEmergencyApiStatusToPath(status: AlertStatus): string {
  switch (status) {
    case 'RECEIVED':
      return pwaScanPaths.sosHelpReceived;
    case 'DISPATCHED':
      return pwaScanPaths.sosHelpDispatched;
    case 'RESOLVED':
      return pwaScanPaths.sosResolved;
    case 'CANCELLED':
      return pwaScanPaths.sosAlertCancelled;
    case 'CONTACTS_ONLY':
      return pwaScanPaths.sosContactsOnly;
    default:
      return pwaScanPaths.sosHelpReceived;
  }
}

/** Scanner journey state machine — maps API statuses to session + route targets. */
export const scannerJourneyStateMachine = {
  mapParkApiStatusToSession,
  mapParkApiStatusToPath,
  mapEmergencyApiStatusToSession,
  mapEmergencyApiStatusToPath,
};
