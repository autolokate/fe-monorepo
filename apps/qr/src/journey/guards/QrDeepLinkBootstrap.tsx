import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlScreenBg, AlScreenSpinner } from '@autolokate/ui';

import { usePwaScan } from '@/features/post-activation-pwa/context/PwaScanContext';
import { useQrJourneyEntry } from '@/hooks/qr/useQrJourneyEntry';
import { reportUserError } from '@/platform/feedback/index';
import { QR_URL_PARAMS } from '@/platform/qr/qr-url-params';
import { qrLogger } from '@/services/qr/qr-logger';
import { scopedOnboardingPath } from '../routing/journey-url-routing';
import { useJourney } from '../JourneyContext';

type QrDeepLinkBootstrapProps = {
  qrCode: string;
};

/** Resolve `/q/:code` before routing — activated QRs skip auth entirely. */
export function QrDeepLinkBootstrap({ qrCode }: QrDeepLinkBootstrapProps) {
  const navigate = useNavigate();
  const { enterFromCode } = useQrJourneyEntry();
  const { updateSession: updatePwaSession } = usePwaScan();
  const { setSelectedFlow, setPhase, updateSession, resetForNewQrEntry } = useJourney();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    void enterFromCode(
      qrCode,
      { setSelectedFlow, setPhase, navigate, updateSession, updatePwaSession, resetForNewQrEntry },
      { entryPoint: 'auth-mobile' },
    ).then((result) => {
      if (!result.ok) {
        reportUserError(qrLogger, 'qr_deep_link_entry_failed', result.error, result.error.message);
        const search = new URLSearchParams({ [QR_URL_PARAMS.qrCode]: qrCode }).toString();
        void navigate(
          { pathname: scopedOnboardingPath(qrCode, '/auth'), search },
          { replace: true },
        );
        return;
      }

      if (result.staysOnAuthScreen) {
        const search = new URLSearchParams({ [QR_URL_PARAMS.qrCode]: qrCode }).toString();
        void navigate(
          { pathname: scopedOnboardingPath(qrCode, '/auth'), search },
          { replace: true },
        );
      }
    });
  }, [
    enterFromCode,
    navigate,
    qrCode,
    resetForNewQrEntry,
    setPhase,
    setSelectedFlow,
    updatePwaSession,
    updateSession,
  ]);

  return (
    <AlScreenBg variant="protected" className="qr-route-loader">
      <AlScreenSpinner size="lg" animated aria-label="Opening QR code" />
    </AlScreenBg>
  );
}
