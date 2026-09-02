import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { pwaScanPaths } from '@/features/post-activation-pwa/constants/pwa-scan-paths';
import { usePwaScan } from '@/features/post-activation-pwa/context/PwaScanContext';
import { reportUserError } from '@/platform/feedback/report-user-error';
import {
  scannerJourneyStateMachine,
  scannerLogger,
  submitParkReport,
  subscribeParkStatusPoll,
} from '@/services/scanner/index';

/** Submit park report on mount (checking route) and navigate tracker screens from poll. */
export function useParkCheckingFlow() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const startedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    updateSession({ parkMeStatus: 'checking' });

    const blockingId = session.parkMePhotoIds.front;
    const blockedId = session.parkMePhotoIds.rear;
    if (!blockingId || !blockedId) {
      reportUserError(
        scannerLogger,
        'park_submit_missing_photo_ids',
        new Error('Missing photo uploads'),
      );
      void navigate(pwaScanPaths.parkMePhotos, { replace: true });
      return;
    }

    void (async () => {
      const result = await submitParkReport({
        name: session.name,
        reporterPlate: session.reporterPlate || undefined,
        photoIds: [blockingId, blockedId],
        geoLat: session.location?.lat,
        geoLng: session.location?.lng,
      });

      if (!result.ok) {
        reportUserError(scannerLogger, 'park_submit_failed', result.error, result.error.message);
        void navigate(pwaScanPaths.parkMePhotos, { replace: true });
        return;
      }

      unsubscribeRef.current = subscribeParkStatusPoll((status) => {
        const sessionStatus = scannerJourneyStateMachine.mapParkApiStatusToSession(status);
        const path = scannerJourneyStateMachine.mapParkApiStatusToPath(status);
        updateSession({ parkMeStatus: sessionStatus });
        void navigate(path, { replace: true });
      }, result.notificationId);
    })();

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [
    navigate,
    session.location?.lat,
    session.location?.lng,
    session.name,
    session.parkMePhotoIds.front,
    session.parkMePhotoIds.rear,
    session.reporterPlate,
    updateSession,
  ]);
}

/** Continue polling when user lands on calling route after checking. */
export function useParkTrackerPoll() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubscribeRef.current = subscribeParkStatusPoll((status) => {
      const sessionStatus = scannerJourneyStateMachine.mapParkApiStatusToSession(status);
      const path = scannerJourneyStateMachine.mapParkApiStatusToPath(status);
      updateSession({ parkMeStatus: sessionStatus });
      void navigate(path, { replace: true });
    });

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [navigate, updateSession]);
}
