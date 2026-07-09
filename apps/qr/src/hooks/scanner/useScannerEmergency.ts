import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { pwaScanPaths } from '@/features/post-activation-pwa/constants/pwa-scan-paths';
import type { PwaSosPhotoIds } from '@/features/post-activation-pwa/context/pwa-scan-types';
import { usePwaScan } from '@/features/post-activation-pwa/context/PwaScanContext';
import { reportUserError } from '@/platform/feedback/report-user-error';
import { anonymousScannerRepository } from '@/platform/storage/repositories/anonymous-scanner-repository';
import {
  cancelScannerEmergency,
  scannerJourneyStateMachine,
  scannerLogger,
  stopEmergencyAlertPoll,
  submitScannerEmergency,
  subscribeEmergencyAlertPoll,
} from '@/services/scanner/index';

function collectScenePhotoIds(photoIds: PwaSosPhotoIds): string[] {
  return Object.values(photoIds).filter((value): value is string => Boolean(value));
}

/** Submit SOS on mount; tracker routes subscribe to the shared poll loop. */
export function useEmergencySendingFlow() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const startedRef = useRef(false);

  const runSubmit = useCallback(
    async (scenePhotoIds: string[]) => {
      updateSession({ sosStatus: 'sending' });
      const result = await submitScannerEmergency({ scenePhotoIds });
      if (!result.ok) {
        reportUserError(scannerLogger, 'emergency_submit_failed', result.error, result.error.message);
        void navigate(pwaScanPaths.sosCouldntSend, { replace: true });
        return;
      }
      updateSession({ sosStatus: 'help-received' });
      void navigate(pwaScanPaths.sosHelpReceived, { replace: true });
    },
    [navigate, updateSession],
  );

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    void runSubmit(collectScenePhotoIds(session.sosPhotoIds));
  }, [runSubmit, session.sosPhotoIds]);

  return { retry: () => runSubmit(collectScenePhotoIds(session.sosPhotoIds)) };
}

/** Subscribe to the shared emergency poll loop — does not cancel in-flight requests on unmount. */
export function useEmergencyTrackerPoll() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubscribeRef.current = subscribeEmergencyAlertPoll((status) => {
      const sessionStatus = scannerJourneyStateMachine.mapEmergencyApiStatusToSession(status);
      const path = scannerJourneyStateMachine.mapEmergencyApiStatusToPath(status);
      updateSession({ sosStatus: sessionStatus });
      void navigate(path, { replace: true });
    });

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [navigate, updateSession]);
}

/** Submit contacts-only SOS without scene photos. */
export function useEmergencyContactsOnlySubmit() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  const startedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    void (async () => {
      const result = await submitScannerEmergency({ scenePhotoIds: [] });
      if (!result.ok) {
        reportUserError(scannerLogger, 'emergency_contacts_submit_failed', result.error, result.error.message);
        return;
      }
      updateSession({ sosStatus: 'contacts-only' });
      unsubscribeRef.current = subscribeEmergencyAlertPoll((status) => {
        const sessionStatus = scannerJourneyStateMachine.mapEmergencyApiStatusToSession(status);
        const path = scannerJourneyStateMachine.mapEmergencyApiStatusToPath(status);
        updateSession({ sosStatus: sessionStatus });
        if (path !== pwaScanPaths.sosContactsOnly) {
          void navigate(path, { replace: true });
        }
      }, result.alertId);
    })();

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [navigate, updateSession]);
}

/** Cancel an active SOS alert via POST /v1/emergency/{alertId}/cancel. */
export function useEmergencyCancelAlert() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  const [cancelling, setCancelling] = useState(false);

  const cancelAlert = useCallback(async () => {
    if (cancelling) {
      return;
    }

    setCancelling(true);
    try {
      stopEmergencyAlertPoll();
      const alertId = anonymousScannerRepository.readAlertId();

      if (alertId) {
        const result = await cancelScannerEmergency(alertId);
        if (!result.ok) {
          reportUserError(scannerLogger, 'emergency_cancel_failed', result.error, result.error.message);
          return;
        }
      }

      updateSession({ sosStatus: 'cancelled' });
      void navigate(pwaScanPaths.sosAlertCancelled);
    } finally {
      setCancelling(false);
    }
  }, [cancelling, navigate, updateSession]);

  return { cancelAlert, cancelling };
}
