import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlIcon } from '@autolokate/icons';
import {
  AlButton,
  AlHeading,
  AlOtpInput,
  AlScannerHubCard,
  AlScannedVehicleCard,
  AlScreenSpinner,
  AlText,
} from '@autolokate/ui';

import { A1MobileScreen } from '../../shared-auth/screens/a1-mobile/index';
import { A3VehicleOwnerScreen } from '../../shared-auth/screens/a3-vehicle-owner/index';
import { formatMobileLocal } from '@/shared/format-mobile';
import {
  clampMobileInput,
  isValidMobile,
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
} from '../../shared-auth/auth-flow/auth-flow.validation';
import type { AuthMobileState, AuthOtpState } from '../../shared-auth/types';
import { PWA_BOOTSTRAP_MS } from '../constants/pwa-scan-paths';
import { pwaScanPaths } from '../constants/pwa-scan-paths';
import { PWA_LOADING_COPY } from '../data/pwa-content';
import { usePwaScan } from '../context/PwaScanContext';
import type { PwaFlowIntent } from '../context/pwa-scan-types';
import { PwaScanShell } from '../components/PwaScanShell';
import { PwaVerifyShell } from '../components/PwaVerifyShell';
import { PwaFade, PwaSpringPress } from '../components/PwaMotion';
import { useQrResolve } from '../../../hooks/qr/useQrResolve';
import { useParkOtp } from '../../../hooks/scanner/index';
import { reportUserError } from '../../../platform/feedback/report-user-error';
import { scannerLogger } from '../../../services/scanner/index';
import {
  applyActivatedQrToPwaSession,
  isQrEntryUrl,
} from '../../../platform/index';

import '../styles/pwa-scan.css';

const VERIFY_OTP_SUCCESS_HOLD_MS = 2000;
const SAVE_NAME_MS = 500;

/** 01 · Opening spinner — Figma 928:2252. */
export function PwaLoadingRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateSession } = usePwaScan();
  const { resolveEntry } = useQrResolve();
  const qrHandledRef = useRef(false);

  useEffect(() => {
    if (qrHandledRef.current || !isQrEntryUrl(searchParams)) {
      return;
    }

    void (async () => {
      const result = await resolveEntry(searchParams);
      if (!result.ok || result.payload.type !== 'activated') {
        return;
      }

      qrHandledRef.current = true;
      applyActivatedQrToPwaSession(result.payload, updateSession);
    })();
  }, [resolveEntry, searchParams, updateSession]);

  const finishBootstrap = useCallback(() => {
    updateSession({ bootstrapComplete: true });
    void navigate(pwaScanPaths.vehicle, { replace: true });
  }, [navigate, updateSession]);

  useEffect(() => {
    const timer = window.setTimeout(finishBootstrap, PWA_BOOTSTRAP_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [finishBootstrap]);

  return (
    <PwaScanShell variant="protected">
      <PwaFade className="pwa-scan-status-body">
        <AlScreenSpinner size="lg" animated aria-label={PWA_LOADING_COPY.title} />
        <AlHeading variant="h2" className="pwa-scan-status-body__title">
          {PWA_LOADING_COPY.title}
        </AlHeading>
        <AlText tone="muted" align="center" className="pwa-scan-status-body__description">
          {PWA_LOADING_COPY.description}
        </AlText>
      </PwaFade>
    </PwaScanShell>
  );
}

function useResumePendingFlow() {
  const { session, updateSession } = usePwaScan();
  const navigate = useNavigate();

  return useCallback(
    (flowOverride?: PwaFlowIntent) => {
      const flow = flowOverride ?? session.pendingFlow;
      updateSession({ verified: true, pendingFlow: null });

      if (flow === 'park-me') {
        void navigate(pwaScanPaths.parkMeVehicleNumber);
        return;
      }
      if (flow === 'sos') {
        void navigate(pwaScanPaths.sos);
        return;
      }
      void navigate(pwaScanPaths.vehicle);
    },
    [navigate, session.pendingFlow, updateSession],
  );
}

function startFlow(
  flow: Exclude<PwaFlowIntent, null>,
  verified: boolean,
  updateSession: ReturnType<typeof usePwaScan>['updateSession'],
  navigate: ReturnType<typeof useNavigate>,
) {
  if (flow === 'sos') {
    updateSession({ pendingFlow: null });
    void navigate(pwaScanPaths.sos);
    return;
  }

  if (!verified) {
    updateSession({ pendingFlow: flow });
    void navigate(pwaScanPaths.verifyMobile);
    return;
  }

  void navigate(pwaScanPaths.parkMeVehicleNumber);
}

/** 02 · Scanned vehicle hub — Park Me or SOS. */
export function PwaVehicleFoundRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const { scannedVehicle } = session;
  const footerLabel = scannedVehicle.protected ? 'Protected by Autolokate' : undefined;

  return (
    <PwaScanShell variant="protected">
      <PwaFade className="pwa-scan-screen pwa-scan-vehicle-found">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2" className="pwa-scan-vehicle-found__title">
            You scanned this vehicle
          </AlHeading>
          <AlText tone="muted" className="pwa-scan-vehicle-found__description">
            We&apos;ll reach the owner or get help fast.
          </AlText>
        </div>

        <AlScannedVehicleCard
          className="pwa-scan-vehicle-found__card"
          plate={scannedVehicle.plate}
          model={scannedVehicle.modelSummary}
          {...(footerLabel ? { footerLabel } : {})}
        />

        <div className="pwa-scan-hub-section pwa-scan-vehicle-found__hub">
          <AlHeading variant="h2" className="pwa-scan-vehicle-found__hub-title">
            What do you need?
          </AlHeading>
          <div className="pwa-scan-hub-cards">
            <PwaSpringPress>
              <AlScannerHubCard
                variant="park-me"
                title="It's blocking me"
                subtitle="We'll ask the owner to move it"
                icon={<AlIcon name="square-parking" size={24} aria-hidden />}
                chevron={<AlIcon name="chevron-right" size={22} aria-hidden />}
                onSelect={() => {
                  startFlow('park-me', session.verified, updateSession, navigate);
                }}
              />
            </PwaSpringPress>
            <PwaSpringPress>
              <AlScannerHubCard
                variant="emergency"
                title="There is an emergency"
                subtitle="Send help right now"
                icon={<AlIcon name="bell" size={24} aria-hidden />}
                chevron={<AlIcon name="chevron-right" size={22} aria-hidden />}
                onSelect={() => {
                  startFlow('sos', session.verified, updateSession, navigate);
                }}
              />
            </PwaSpringPress>
          </div>
        </div>
      </PwaFade>
    </PwaScanShell>
  );
}

/** 03 · Bystander verify — mobile. */
export function PwaVerifyMobileRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const { requestOtp, isRequesting } = useParkOtp();
  const [mobileState, setMobileState] = useState<AuthMobileState>('empty');

  const handleContinue = () => {
    if (!isValidMobile(session.mobile) || !session.consentAccepted) {
      setMobileState('error');
      return;
    }

    setMobileState('loading');
    void (async () => {
      const result = await requestOtp(session.mobile);
      if (!result.ok) {
        setMobileState('error');
        reportUserError(scannerLogger, 'park_otp_request_failed', result.error, result.error.message);
        return;
      }
      setMobileState('empty');
      void navigate(pwaScanPaths.verifyOtp);
    })();
  };

  return (
    <PwaFade>
      <A1MobileScreen
        hideProgress
        title="What's your number?"
        description="So the owner can reach you about their vehicle. We'll text a code."
        footerLabel="Get OTP"
        consentVariant="bystander"
        mobileState={isRequesting ? 'loading' : mobileState}
        mobileValue={session.mobile}
        onMobileChange={(value) => {
          updateSession({ mobile: clampMobileInput(value) });
          if (mobileState === 'error') {
            setMobileState('empty');
          }
        }}
        consentAccepted={session.consentAccepted}
        onConsentChange={(accepted) => {
          updateSession({ consentAccepted: accepted });
        }}
        onContinue={handleContinue}
        onBack={() => {
          void navigate(pwaScanPaths.vehicle);
        }}
      />
    </PwaFade>
  );
}

/** 04 · Bystander verify — OTP. */
export function PwaVerifyOtpRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const { verifyOtp, requestOtp, isVerifying } = useParkOtp();
  const [otp, setOtp] = useState('');
  const [otpState, setOtpState] = useState<AuthOtpState>('default');
  const [otpErrorText, setOtpErrorText] = useState<string | undefined>(undefined);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const successScheduledRef = useRef(false);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [resendCooldown]);

  const completeOtpSuccess = useCallback(() => {
    if (successScheduledRef.current) {
      return;
    }
    successScheduledRef.current = true;
    updateSession({ verified: true });
    setOtpState('success');
    window.setTimeout(() => {
      void navigate(pwaScanPaths.verifyName);
    }, VERIFY_OTP_SUCCESS_HOLD_MS);
  }, [navigate, updateSession]);

  const runVerify = useCallback(
    async (code: string) => {
      if (code.length < OTP_LENGTH || otpState === 'success' || isVerifying) {
        return;
      }
      setOtpErrorText(undefined);
      const result = await verifyOtp(session.mobile, code);
      if (!result.ok) {
        setOtpState('error');
        setOtpErrorText(result.error.apiMessage ?? result.error.message);
        reportUserError(scannerLogger, 'park_otp_verify_failed', result.error, result.error.message);
        return;
      }
      completeOtpSuccess();
    },
    [completeOtpSuccess, isVerifying, otpState, session.mobile, verifyOtp],
  );

  const handleVerify = () => {
    void runVerify(otp);
  };

  const canResend = resendCooldown === 0 && otpState !== 'success';
  const otpInputState =
    otpState === 'success' ? 'success' : otpState === 'error' ? 'error' : 'empty';

  return (
    <PwaVerifyShell
      title="Enter the 6-digit code"
      description={
        <p className="ob-auth-otp-desc">
          Sent on WhatsApp to {formatMobileLocal(session.mobile)}{' '}
          <button
            type="button"
            className="ob-auth-otp-desc__change"
            onClick={() => {
              void navigate(pwaScanPaths.verifyMobile);
            }}
          >
            Change
          </button>
        </p>
      }
      showBack
      onBack={() => {
        void navigate(pwaScanPaths.verifyMobile);
      }}
      footer={
        <AlButton
          variant="primary"
          disabled={otpState === 'success' || otp.length < OTP_LENGTH || isVerifying}
          onClick={handleVerify}
        >
          Verify
        </AlButton>
      }
    >
      <AlOtpInput
        className="ob-auth-otp-input"
        length={OTP_LENGTH}
        value={otp}
        onChange={(value) => {
          setOtp(value);
          setOtpErrorText(undefined);
          if (otpState === 'error') {
            setOtpState('default');
          }
          if (value.length === OTP_LENGTH && otpState !== 'success') {
            void runVerify(value);
          }
        }}
        state={otpInputState}
        disabled={otpState === 'success' || isVerifying}
      />
      <div className="ob-auth-otp-status">
        {otpErrorText ? (
          <p className="ob-otp-validation-error" role="alert">
            {otpErrorText}
          </p>
        ) : null}
        {canResend ? (
          <button
            type="button"
            className="ob-auth-otp-resend-link"
            onClick={() => {
              void (async () => {
                const result = await requestOtp(session.mobile);
                if (!result.ok) {
                  reportUserError(
                    scannerLogger,
                    'park_otp_resend_failed',
                    result.error,
                    result.error.message,
                  );
                  return;
                }
                setResendCooldown(RESEND_COOLDOWN_SECONDS);
                setOtp('');
                successScheduledRef.current = false;
                setOtpErrorText(undefined);
                setOtpState('default');
              })();
            }}
          >
            Resend code
          </button>
        ) : resendCooldown > 0 ? (
          <p className="ob-auth-otp-countdown">
            Resend code in 0:{String(resendCooldown).padStart(2, '0')}
          </p>
        ) : null}
      </div>
    </PwaVerifyShell>
  );
}

/** 05 · Bystander verify — display name. */
export function PwaVerifyNameRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const resumePendingFlow = useResumePendingFlow();
  const [nameState, setNameState] = useState<'empty' | 'loading'>('empty');

  const handleContinue = () => {
    if (!session.name.trim()) {
      return;
    }
    setNameState('loading');
    window.setTimeout(() => {
      resumePendingFlow();
    }, SAVE_NAME_MS);
  };

  return (
    <PwaFade>
      <A3VehicleOwnerScreen
        title="What should we call you?"
        description="So the owner knows who reached out"
        footerLabel="Continue"
        nameValue={session.name}
        nameState={nameState}
        onNameChange={(value) => {
          updateSession({ name: value });
        }}
        onContinue={handleContinue}
        onBack={() => {
          void navigate(pwaScanPaths.verifyOtp);
        }}
      />
    </PwaFade>
  );
}
