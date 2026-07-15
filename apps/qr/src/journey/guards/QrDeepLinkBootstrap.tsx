import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlScreenBg, AlScreenSpinner } from '@autolokate/ui';

import { usePwaScan } from '@/features/post-activation-pwa/context/PwaScanContext';
import { useQrJourneyEntry } from '@/hooks/qr/useQrJourneyEntry';
import { reportUserError } from '@/platform/feedback/index';
import { QR_URL_PARAMS } from '@/platform/qr/qr-url-params';
import { hasAuthTokens } from '@/services/auth/ensure-valid-auth-session';
import { qrLogger } from '@/services/qr/qr-logger';
import { scopedOnboardingPath } from '../routing/journey-url-routing';
import { resolveSignedInBouncePath } from '../resume/journey-resume-path';
import { useJourney } from '../JourneyContext';

type QrDeepLinkBootstrapProps = {
  qrCode: string;
};

/**
 * Resolve `/q/:code` before routing.
 * Always calls resolve once per code. ACTIVATED starts the activated journey;
 * otherwise a signed-in user returns to their last post-login screen (no auth).
 */
export function QrDeepLinkBootstrap({ qrCode }: QrDeepLinkBootstrapProps) {
  const navigate = useNavigate();
  const { enterFromCode } = useQrJourneyEntry();
  const { updateSession: updatePwaSession } = usePwaScan();
  const {
    setSelectedFlow,
    setPhase,
    updateSession,
    resetForNewQrEntry,
    selectedFlow,
    session,
    lastRoutePath,
  } = useJourney();

  // Capture bounce targets once — do not put session/flow in the effect deps or
  // resetForNewQrEntry / beginPurchase will re-trigger resolve forever.
  const bounceRef = useRef({ selectedFlow, session, lastRoutePath });
  bounceRef.current = { selectedFlow, session, lastRoutePath };

  const startedForCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (startedForCodeRef.current === qrCode) {
      return;
    }
    startedForCodeRef.current = qrCode;

    const signedIn = hasAuthTokens();

    void enterFromCode(
      qrCode,
      {
        setSelectedFlow,
        setPhase,
        navigate,
        updateSession,
        updatePwaSession,
        resetForNewQrEntry,
      },
      { entryPoint: 'auth-mobile', preserveSession: signedIn, forceNetwork: true },
    ).then((result) => {
      if (startedForCodeRef.current !== qrCode) {
        return;
      }

      const bounce = bounceRef.current;

      if (!result.ok) {
        reportUserError(qrLogger, 'qr_deep_link_entry_failed', result.error, result.error.message);
        if (signedIn) {
          void navigate(
            resolveSignedInBouncePath({
              lastRoutePath: bounce.lastRoutePath,
              selectedFlow: bounce.selectedFlow ?? 'purchase',
              session: bounce.session,
            }),
            { replace: true },
          );
          return;
        }
        const search = new URLSearchParams({ [QR_URL_PARAMS.qrCode]: qrCode }).toString();
        void navigate(
          { pathname: scopedOnboardingPath(qrCode, '/auth'), search },
          { replace: true },
        );
        return;
      }

      if (result.outcome === 'activated') {
        return;
      }

      if (signedIn) {
        void navigate(
          resolveSignedInBouncePath({
            lastRoutePath: bounce.lastRoutePath,
            selectedFlow: bounce.selectedFlow ?? 'purchase',
            session: bounce.session,
          }),
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
