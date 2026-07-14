import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { AlScreenBg, AlScreenSpinner } from '@autolokate/ui';

import { PreserveSearchRedirect } from '../guards/PreserveSearchRedirect';

import { L1PrivacyPolicyScreen } from '../../features/shared-legal/screens/l1-privacy-policy/index';
import { L2TermsConditionsScreen } from '../../features/shared-legal/screens/l2-terms-conditions/index';
import {
  clampMobileInput,
  formatMobileInput,
  isValidMobile,
  normalizeMobile,
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
} from '../../features/shared-auth/auth-flow/auth-flow.validation';
import { A1MobileScreen } from '../../features/shared-auth/screens/a1-mobile/index';
import { A2OtpScreen } from '../../features/shared-auth/screens/a2-otp/index';
import { A3VehicleOwnerScreen } from '../../features/shared-auth/screens/a3-vehicle-owner/index';
import { QrScanEntryScreen } from '../../features/shared-auth/screens/qr-scan-entry/index';
import type {
  AuthMobileState,
  AuthOtpState,
  AuthVehicleOwnerState,
} from '../../features/shared-auth/types';
import { useRequestOtp } from '../../hooks/auth/useRequestOtp';
import { useVerifyOtp } from '../../hooks/auth/useVerifyOtp';
import { useUpdateProfile } from '../../hooks/profile/useUpdateProfile';
import { isAppStartupComplete } from '@/platform/app-startup-state';
import { persistQrCodeFromUrl } from '@/platform/qr/qr-code-from-url';
import { extractQrCodeParam } from '@/platform/qr/parse-qr-url';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { QR_URL_PARAMS } from '@/platform/qr/qr-url-params';
import { reportFieldError, reportUserError } from '@/platform/feedback/index';
import { usePwaScan } from '../../features/post-activation-pwa/context/PwaScanContext';
import { useQrJourneyEntry } from '../../hooks/qr/useQrJourneyEntry';
import { authLogger } from '@/services/auth/auth-logger';
import { qrLogger } from '@/services/qr/qr-logger';
import { ensureValidAuthSession, hasAuthTokens } from '@/services/auth/ensure-valid-auth-session';
import { loadLegalDocuments } from '@/services/legal/legal-service';
import { applyVehicleOwnerSaveError } from '../../services/profile/profile-errors';
import { authJourneyPaths, authMobileUrl, isAuthMobileContinueEntry } from '../auth/auth-routing';
import { getAuthFlowBackPath, getPostAuthActivationPath } from '../activation-routing';
import { resolveJourneyResumePath } from '../resume/journey-resume-path';
import { stripOnboardingPrefix } from '../routing/journey-url-routing';
import { useActiveJourneyId } from '../routing/use-active-journey-id';
import { useJourney } from '../JourneyContext';
import {
  applyMobileSendError,
  applyOtpVerifyError,
} from './auth-route-helpers';
import { shouldRequireSignupConsent } from '../auth/signup-consent-policy';
import { BlockLoggedInFromPreLoginAuth } from '../guards/JourneyRouteGuards';

function AuthSegmentBootstrap({ children }: { children: ReactNode }) {
  const { setPhase } = useJourney();

  useEffect(() => {
    setPhase('shared-auth');
  }, [setPhase]);

  return children;
}

type MobileEntryMode = 'loading' | 'scan' | 'form';

function MobileRoute() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    session,
    updateSession,
    setSelectedFlow,
    setPhase,
    selectedFlow,
    resetForNewQrEntry,
    authStatus,
    phase,
    lastRoutePath,
    markAuthLoggedOut,
  } = useJourney();
  const journeyId = useActiveJourneyId();
  const { updateSession: updatePwaSession } = usePwaScan();
  const { enterFromSearchParams } = useQrJourneyEntry();
  const qrResolvedRef = useRef<string | null>(null);
  const bootstrapRef = useRef(false);
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [entryMode, setEntryMode] = useState<MobileEntryMode>('loading');

  const qrCode = extractQrCodeParam(searchParams);
  const authContinue = isAuthMobileContinueEntry(searchParams);

  // Logged-in users must never see mobile auth unless tokens were cleared.
  useEffect(() => {
    if (!bootstrapDone || !hasAuthTokens()) {
      return;
    }
    if (!selectedFlow) {
      setSelectedFlow('purchase');
    }
    const flow = selectedFlow ?? 'purchase';
    void navigate(getPostAuthActivationPath(flow, journeyId ?? undefined, session), {
      replace: true,
    });
  }, [
    bootstrapDone,
    journeyId,
    navigate,
    selectedFlow,
    session,
    setSelectedFlow,
  ]);

  useEffect(() => {
    if (bootstrapRef.current) {
      return;
    }
    bootstrapRef.current = true;

    void (async () => {
      if (isAppStartupComplete()) {
        const signedIn = (await ensureValidAuthSession()) === 'valid';

        if (signedIn && !qrCode) {
          const resumePath = resolveJourneyResumePath(
            { selectedFlow, authStatus, session, lastRoutePath },
            phase,
            lastRoutePath,
          );
          void navigate(resumePath, { replace: true });
          return;
        }

        if (signedIn && qrCode) {
          persistQrCodeFromUrl(searchParams);
          if (!selectedFlow) {
            setSelectedFlow('purchase');
          }
          void navigate(
            getPostAuthActivationPath(selectedFlow ?? 'purchase', journeyId ?? qrCode, session),
            { replace: true },
          );
          return;
        }

        if (!qrCode) {
          if (authContinue && selectedFlow) {
            setEntryMode('form');
            setBootstrapDone(true);
            return;
          }

          if (hasAuthTokens()) {
            const resumePath = resolveJourneyResumePath(
              { selectedFlow, authStatus, session, lastRoutePath },
              phase,
              lastRoutePath,
            );
            void navigate(resumePath, { replace: true });
            return;
          }

          resetForNewQrEntry();
          setEntryMode('scan');
          setBootstrapDone(true);
          return;
        }

        setBootstrapDone(true);
        return;
      }

      const sessionValidity = await ensureValidAuthSession();
      if (sessionValidity === 'logged_out') {
        markAuthLoggedOut();
      }

      const signedIn = sessionValidity === 'valid';

      if (signedIn && !qrCode) {
        const resumePath = resolveJourneyResumePath(
          { selectedFlow, authStatus, session, lastRoutePath },
          phase,
          lastRoutePath,
        );
        void navigate(resumePath, { replace: true });
        return;
      }

      if (signedIn && qrCode) {
        persistQrCodeFromUrl(searchParams);
        if (!selectedFlow) {
          setSelectedFlow('purchase');
        }
        void navigate(
          getPostAuthActivationPath(selectedFlow ?? 'purchase', journeyId ?? qrCode, session),
          { replace: true },
        );
        return;
      }

      if (!qrCode) {
        if (authContinue && selectedFlow) {
          setEntryMode('form');
          setBootstrapDone(true);
          return;
        }

        if (hasAuthTokens()) {
          const resumePath = resolveJourneyResumePath(
            { selectedFlow, authStatus, session, lastRoutePath },
            phase,
            lastRoutePath,
          );
          void navigate(resumePath, { replace: true });
          return;
        }

        resetForNewQrEntry();
        setEntryMode('scan');
        setBootstrapDone(true);
        return;
      }

      setBootstrapDone(true);
    })();
  }, [
    authContinue,
    authStatus,
    journeyId,
    lastRoutePath,
    markAuthLoggedOut,
    navigate,
    phase,
    qrCode,
    resetForNewQrEntry,
    searchParams,
    selectedFlow,
    session,
    setSelectedFlow,
  ]);

  useEffect(() => {
    if (!bootstrapDone || !qrCode) {
      return;
    }

    if (hasAuthTokens()) {
      if (!selectedFlow) {
        setSelectedFlow('purchase');
      }
      void navigate(
        getPostAuthActivationPath(selectedFlow ?? 'purchase', journeyId ?? qrCode, session),
        { replace: true },
      );
      return;
    }

    if (selectedFlow === 'purchase' && resolvePurchaseQrCode() === qrCode) {
      setEntryMode('form');
      return;
    }

    if (qrResolvedRef.current === qrCode) {
      return;
    }
    qrResolvedRef.current = qrCode;

    setEntryMode('loading');
    persistQrCodeFromUrl(searchParams);
    void enterFromSearchParams(
      searchParams,
      { setSelectedFlow, setPhase, navigate, updateSession, updatePwaSession, resetForNewQrEntry },
      { entryPoint: 'auth-mobile' },
    ).then((result) => {
      // Only settle UI for the code we started; ignore stale completions.
      if (qrResolvedRef.current !== qrCode) {
        return;
      }
      if (!result.ok) {
        reportUserError(qrLogger, 'auth_mobile_qr_entry_failed', result.error, result.error.message);
        setEntryMode('form');
        return;
      }
      if (result.staysOnAuthScreen) {
        setEntryMode('form');
      }
    });
    // Intentionally omit session/selectedFlow — those change during resolve and must
    // not re-fire entry (would force-loop GET /resolve).
  }, [
    bootstrapDone,
    enterFromSearchParams,
    journeyId,
    navigate,
    qrCode,
    resetForNewQrEntry,
    searchParams,
    setPhase,
    setSelectedFlow,
    updatePwaSession,
    updateSession,
  ]);

  const handleQrCodeDetected = useCallback(
    (code: string) => {
      const next = new URLSearchParams(searchParams);
      next.set(QR_URL_PARAMS.qrCode, code.trim());
      qrResolvedRef.current = null;
      setEntryMode('loading');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  if (entryMode === 'loading') {
    return (
      <AlScreenBg variant="protected" className="qr-route-loader">
        <AlScreenSpinner size="lg" animated aria-label="Loading" />
      </AlScreenBg>
    );
  }

  if (entryMode === 'scan') {
    return <QrScanEntryScreen onQrCodeDetected={handleQrCodeDetected} />;
  }

  if (hasAuthTokens()) {
    return (
      <AlScreenBg variant="protected" className="qr-route-loader">
        <AlScreenSpinner size="lg" animated aria-label="Continuing" />
      </AlScreenBg>
    );
  }

  return <MobileAuthForm />;
}

function MobileAuthForm() {
  const navigate = useNavigate();
  const { session, updateSession, selectedFlow } = useJourney();
  const auth = session.auth ?? {};
  const { requestOtp, isPending: isRequestOtpPending } = useRequestOtp();
  const requireConsent = shouldRequireSignupConsent(selectedFlow);

  const [mobile, setMobile] = useState(auth.mobileDisplay ?? '');
  const [consent, setConsent] = useState(auth.consentAccepted ?? false);
  const [mobileState, setMobileState] = useState<AuthMobileState>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'empty',
  );

  useEffect(() => {
    const handleOnline = () => {
      if (mobileState === 'offline') {
        setMobileState(mobile.trim() ? (requireConsent && !consent ? 'filled' : 'ready') : 'empty');
      }
    };
    const handleOffline = () => {
      setMobileState('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [consent, mobile, mobileState, requireConsent]);

  const syncMobileState = useCallback(
    (nextMobile: string, nextConsent: boolean) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setMobileState('offline');
        return;
      }
      const digits = normalizeMobile(nextMobile);
      if (!digits) {
        setMobileState('empty');
        return;
      }
      setMobileState(requireConsent && !nextConsent ? 'filled' : 'ready');
    },
    [requireConsent],
  );

  const handleContinue = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setMobileState('offline');
      return;
    }
    if (!isValidMobile(mobile)) {
      setMobileState('error');
      return;
    }
    if (requireConsent && !consent) {
      setMobileState('filled');
      return;
    }
    setMobileState('loading');
    const mobileDigits = normalizeMobile(mobile);
    const result = await requestOtp({ mobileDigits });
    if (!result.ok) {
      setMobileState(applyMobileSendError(result.error));
      return;
    }
    updateSession({
      auth: {
        ...auth,
        mobile: mobileDigits,
        mobileDisplay: formatMobileInput(mobile),
        consentAccepted: requireConsent ? consent : false,
      },
    });
    void navigate(authJourneyPaths.otp);
  };

  return (
    <A1MobileScreen
      mobileState={isRequestOtpPending ? 'loading' : mobileState}
      mobileValue={mobile}
      requireConsent={requireConsent}
      onMobileChange={(value) => {
        const formatted = clampMobileInput(value);
        setMobile(formatted);
        if (mobileState === 'error') {
          syncMobileState(formatted, consent);
          return;
        }
        syncMobileState(formatted, consent);
      }}
      consentAccepted={consent}
      onConsentChange={(accepted) => {
        setConsent(accepted);
        syncMobileState(mobile, accepted);
      }}
      onPrivacyClick={() => {
        void navigate(authJourneyPaths.privacy);
      }}
      onTermsClick={() => {
        void navigate(authJourneyPaths.terms);
      }}
      onBack={() => {
        void navigate(getAuthFlowBackPath(selectedFlow));
      }}
      onContinue={() => {
        void handleContinue();
      }}
    />
  );
}

export type AuthRoutesProps = {
  onAuthCompleted?: () => void | Promise<void>;
};

function OtpRoute({ onAuthCompleted }: AuthRoutesProps) {
  const navigate = useNavigate();
  const { session, updateSession, selectedFlow } = useJourney();
  const auth = session.auth ?? {};
  const mobile = auth.mobile ?? '';
  const { requestOtp } = useRequestOtp();
  const { verifyOtp, isPending: isVerifyOtpPending } = useVerifyOtp();

  const [otp, setOtp] = useState('');
  const [otpState, setOtpState] = useState<AuthOtpState>('default');
  const [otpErrorKind, setOtpErrorKind] = useState<'wrong' | 'expired' | null>(null);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendAttempts, setResendAttempts] = useState(0);

  useEffect(() => {
    if (!mobile) {
      void navigate(authMobileUrl({ continueAuth: Boolean(selectedFlow) }), { replace: true });
    }
  }, [mobile, navigate, selectedFlow]);

  useEffect(() => {
    if (resendCooldown === 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [resendCooldown]);

  useEffect(() => {
    const handleOnline = () => {
      setOtpState((current) => (current === 'offline' ? 'default' : current));
    };
    const handleOffline = () => {
      setOtpState('offline');
    };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOtpState('offline');
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleVerify = async (code = otp) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOtpState('offline');
      return;
    }
    if (code.length < OTP_LENGTH) {
      setOtpState('default');
      return;
    }

    setOtpState('verifying');
    const result = await verifyOtp({
      mobileDigits: mobile,
      code,
      consentAccepted: auth.consentAccepted,
    });

    if (!result.ok) {
      const mapped = applyOtpVerifyError(result.error);
      setOtpErrorKind(mapped.otpErrorKind);
      setOtpState(mapped.otpState);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOtpState('network-error');
      return;
    }

    setOtpState('success');
    updateSession({
      auth: {
        ...auth,
        otpVerified: true,
        isNewUser: result.data.isNewUser,
        ...result.data.journeyPatch,
      },
    });

    if (result.data.isNewUser) {
      void navigate(authJourneyPaths.vehicleOwner);
      return;
    }

    await onAuthCompleted?.();
  };

  const handleResend = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOtpState('resend-failed');
      return;
    }
    if (resendAttempts >= 1 && typeof navigator !== 'undefined' && !navigator.onLine) {
      setOtpState('resend-failed');
      return;
    }
    const result = await requestOtp({ mobileDigits: mobile, channel: 'sms' });
    if (!result.ok) {
      if (result.error.type === 'offline') {
        setOtpState('offline');
        return;
      }
      setOtpState('resend-failed');
      return;
    }
    setResendAttempts((count) => count + 1);
    setOtp('');
    setOtpErrorKind(null);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setOtpState('default');
  };

  return (
    <A2OtpScreen
      otpState={isVerifyOtpPending && otpState !== 'success' ? 'verifying' : otpState}
      mobile={mobile}
      otpValue={otp}
      onOtpChange={(value) => {
        setOtp(value);
        if (value.length === OTP_LENGTH) {
          if (otpState !== 'verifying' && otpState !== 'success' && !isVerifyOtpPending) {
            void handleVerify(value);
          }
          return;
        }
        if (otpState === 'error' || otpState === 'network-error' || otpState === 'resend-failed') {
          setOtpState(value.length > 0 ? 'typing' : 'default');
          setOtpErrorKind(null);
        } else if (value.length > 0) {
          setOtpState('typing');
        } else {
          setOtpState('default');
        }
      }}
      otpErrorKind={otpErrorKind}
      resendCooldownSeconds={resendCooldown}
      onResendOtp={() => {
        void handleResend();
      }}
      onSmsFallback={() => {
        void handleResend();
      }}
      onChangeNumber={() => {
        void navigate(authMobileUrl({ continueAuth: Boolean(selectedFlow) }));
      }}
      onBack={() => {
        void navigate(authMobileUrl({ continueAuth: Boolean(selectedFlow) }));
      }}
      onContinue={() => {
        void handleVerify();
      }}
    />
  );
}

function VehicleOwnerRoute({ onAuthCompleted }: AuthRoutesProps) {
  const navigate = useNavigate();
  const { session, updateSession, selectedFlow } = useJourney();
  const auth = session.auth ?? {};
  const { updateProfile, isPending: isUpdateProfilePending } = useUpdateProfile();

  const [name, setName] = useState(auth.ownerName ?? '');
  const [nameState, setNameState] = useState<AuthVehicleOwnerState>('empty');
  const [nameErrorMessage, setNameErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.otpVerified || !auth.mobile) {
      if (hasAuthTokens()) {
        void onAuthCompleted?.();
        return;
      }
      void navigate(authMobileUrl({ continueAuth: Boolean(selectedFlow) }), { replace: true });
      return;
    }
    // Existing / returning users skip name — never park them on profile via back navigation.
    if (auth.isNewUser === false || (hasAuthTokens() && auth.isNewUser !== true && auth.ownerName)) {
      void onAuthCompleted?.();
    }
  }, [
    auth.isNewUser,
    auth.mobile,
    auth.otpVerified,
    auth.ownerName,
    navigate,
    onAuthCompleted,
    selectedFlow,
  ]);

  useEffect(() => {
    if (name.trim()) {
      setNameState('filled');
    } else {
      setNameState('empty');
    }
  }, [name]);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameState('empty');
      setNameErrorMessage(null);
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setNameState('error');
      setNameErrorMessage(
        reportFieldError(
          authLogger,
          'profile_name_save_offline',
          new Error('offline'),
          "Couldn't save your name, check your connection and try again",
        ),
      );
      return;
    }
    setNameState('loading');
    setNameErrorMessage(null);
    const result = await updateProfile({ name: trimmed });
    if (!result.ok) {
      setNameState(applyVehicleOwnerSaveError(result.error));
      setNameErrorMessage(
        reportFieldError(
          authLogger,
          'profile_name_save_failed',
          result.error,
          "Couldn't save your name, check your connection and try again",
        ),
      );
      return;
    }
    updateSession({
      auth: {
        ...auth,
        ...result.data.journeyPatch,
        ownerName: result.data.journeyPatch.ownerName ?? trimmed,
        isNewUser: false,
      },
    });
    await onAuthCompleted?.();
  };

  return (
    <A3VehicleOwnerScreen
      nameValue={name}
      nameState={isUpdateProfilePending ? 'loading' : nameState}
      nameErrorMessage={nameErrorMessage}
      onNameChange={(value) => {
        setName(value);
        if (nameState === 'error') {
          setNameState(value.trim() ? 'filled' : 'empty');
          setNameErrorMessage(null);
        }
      }}
      onBack={() => {
        // Never send a logged-in user back into OTP.
        void navigate(getAuthFlowBackPath(selectedFlow), { replace: true });
      }}
      onContinue={() => {
        void handleContinue();
      }}
    />
  );
}

function PrivacyRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    void loadLegalDocuments().then((result) => {
      if (!result.ok) {
        reportUserError(authLogger, 'legal_documents_load_failed', result.error);
      }
    });
  }, []);

  return (
    <L1PrivacyPolicyScreen
      onBack={() => {
        void navigate(-1);
      }}
      onContinue={() => {
        void navigate(-1);
      }}
    />
  );
}

function TermsRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    void loadLegalDocuments().then((result) => {
      if (!result.ok) {
        reportUserError(authLogger, 'legal_documents_load_failed', result.error);
      }
    });
  }, []);

  return (
    <L2TermsConditionsScreen
      onBack={() => {
        void navigate(-1);
      }}
      onContinue={() => {
        void navigate(-1);
      }}
    />
  );
}

function resolveAuthRouteContent(
  pathname: string,
  onAuthCompleted?: () => void | Promise<void>,
): ReactNode {
  const path = stripOnboardingPrefix(pathname).replace(/\/+$/, '') || '/';

  switch (path) {
    case '/auth':
      return (
        <BlockLoggedInFromPreLoginAuth>
          <MobileRoute />
        </BlockLoggedInFromPreLoginAuth>
      );
    case '/otp':
      return (
        <BlockLoggedInFromPreLoginAuth>
          <OtpRoute onAuthCompleted={onAuthCompleted} />
        </BlockLoggedInFromPreLoginAuth>
      );
    case '/profile':
      return <VehicleOwnerRoute onAuthCompleted={onAuthCompleted} />;
    case authJourneyPaths.privacy:
      return <PrivacyRoute />;
    case authJourneyPaths.terms:
      return <TermsRoute />;
    default:
      return <PreserveSearchRedirect to={authJourneyPaths.mobile} />;
  }
}

export function AuthRoutes({ onAuthCompleted }: AuthRoutesProps) {
  const { pathname } = useLocation();

  return (
    <AuthSegmentBootstrap>
      {resolveAuthRouteContent(pathname, onAuthCompleted)}
    </AuthSegmentBootstrap>
  );
}
