import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlPermissionSheet } from '@autolokate/ui';

import {
  E01RiderPromptScreen,
  E02RiderMobileScreen,
  E03RiderOtpScreen,
  E04RiderNameScreen,
  E10RidersSummaryScreen,
} from '../../../features/emergency/screens/index';
import {
  canAddRider,
  getEntitledRiderSlots,
  getRiderPromptDescription,
  shouldEnterRiderPrompt,
} from '../../../features/emergency/emergency-limits';
import {
  isValidEmergencyName,
  isValidMobile,
  normalizeMobile,
  clampMobileInput,
} from '../../../features/emergency/emergency.validation';
import {
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
} from '../../../features/shared-auth/auth-flow/auth-flow.validation';
import { useRiders } from '@/hooks/emergency/index';
import { reportEmergencyApiError } from '@/platform/feedback/report-emergency-api-error';
import { readEmergencyApiUserMessage } from '@/services/emergency/emergency-api-errors';
import { riderLogger } from '@/services/rider/rider-logger';
import type {
  EmergencyNameFormState,
  RelationshipId,
} from '../../../features/emergency/types';
import { getCompletedPath, getEmergencyFlowBackPath } from '../../activation-routing';
import { usePreventBrowserBack } from '@/platform/navigation/use-prevent-browser-back';
import { emergencyJourneyPaths } from '../../emergency/emergency-routing';
import { useJourney } from '../../JourneyContext';
import {
  hasRiderEntitlementInPurchaseSession,
  mapOtpErrorKind,
  resolveR0InitialViewState,
  RIDER_SKIP_CONFIRM_BODY,
  RIDER_SKIP_CONFIRM_TITLE,
  useEmergencyFoundation,
  useEmergencySession,
  useOnlineState,
  VERIFY_OTP_SUCCESS_MS,
} from './emergency-route-shared';

export function R0Route() {
  const navigate = useNavigate();
  const { selectedFlow, session, setPhase } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const purchase = session.purchase;
  const { planId, riderCount, flowKind } = useEmergencyFoundation();
  const { refresh: refreshRiders } = useRiders(selectedFlow);
  const isOnline = useOnlineState();
  const entitledSlots = getEntitledRiderSlots(planId, riderCount, flowKind);
  const [viewState, setViewState] = useState(() =>
    resolveR0InitialViewState(
      typeof navigator === 'undefined' ? true : navigator.onLine,
      Boolean(emergency.riderPromptLoadFailed),
      purchase,
    ),
  );
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);

  useEffect(() => {
    if (!shouldEnterRiderPrompt(planId, riderCount, flowKind)) {
      return;
    }
    if (!isOnline) {
      setViewState('offline');
      return;
    }

    if (hasRiderEntitlementInPurchaseSession(purchase) && loadAttempt === 0 && emergency.riders) {
      setViewState('default');
      return;
    }

    setViewState('loading');
    let cancelled = false;

    void refreshRiders(true).then((result) => {
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        const apiMessage = readEmergencyApiUserMessage(result.error);
        if (apiMessage) {
          // E01 has no input — snackbar only (do not also put the message in description).
          reportEmergencyApiError(riderLogger, 'riders_load_failed', result.error);
          setApiErrorMessage(null);
          patchEmergency({ riderPromptLoadFailed: true });
          setViewState('error');
          return;
        }
        patchEmergency({ riders: [], riderPromptLoadFailed: false });
        setApiErrorMessage(null);
        setViewState('default');
        return;
      }
      patchEmergency({ riders: result.riders, riderPromptLoadFailed: false });
      setApiErrorMessage(null);
      setViewState('default');
    });

    return () => {
      cancelled = true;
    };
  }, [
    emergency.riders,
    flowKind,
    isOnline,
    loadAttempt,
    patchEmergency,
    planId,
    purchase,
    refreshRiders,
    riderCount,
  ]);

  if (!shouldEnterRiderPrompt(planId, riderCount, flowKind)) {
    return <Navigate to={emergencyJourneyPaths.contactsEmpty} replace />;
  }

  if (emergency.riderSkipped) {
    return <Navigate to={getCompletedPath()} replace />;
  }

  const finishWithoutRider = () => {
    setSkipConfirmOpen(false);
    patchEmergency({ riderSkipped: true, rider: undefined });
    setPhase('completed');
    void navigate(getCompletedPath(), { replace: true });
  };

  return (
    <>
      <E01RiderPromptScreen
      viewState={viewState}
      description={getRiderPromptDescription(entitledSlots)}
      errorMessage={apiErrorMessage}
      onBack={() => {
        void navigate(getEmergencyFlowBackPath(selectedFlow, session));
      }}
      onContinue={() => {
        if (viewState === 'error') {
          patchEmergency({ riderPromptLoadFailed: false });
          setApiErrorMessage(null);
          setLoadAttempt((attempt) => attempt + 1);
          return;
        }
        if (viewState === 'offline' || viewState === 'loading') {
          return;
        }
        patchEmergency({
          riderSkipped: false,
          rider: emergency.rider ?? { mobile: '', name: '', relation: 'spouse' },
        });
        void navigate(emergencyJourneyPaths.riderMobile);
      }}
      footerSecondaryLabel="Skip for now"
      onFooterSecondary={() => {
        setSkipConfirmOpen(true);
      }}
    />
      <AlPermissionSheet
        open={skipConfirmOpen}
        title={RIDER_SKIP_CONFIRM_TITLE}
        description={RIDER_SKIP_CONFIRM_BODY}
        primaryLabel="Add Rider"
        onPrimary={() => {
          setSkipConfirmOpen(false);
        }}
        secondaryLabel="Continue Without Rider"
        onSecondary={finishWithoutRider}
        onDismiss={() => {
          setSkipConfirmOpen(false);
        }}
      />
    </>
  );
}

export function R1Route() {
  const navigate = useNavigate();
  const { selectedFlow } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const { requestOtp } = useRiders(selectedFlow);
  const isOnline = useOnlineState();
  const [mobile, setMobile] = useState(emergency.rider?.mobile ?? '');
  const [mobileState, setMobileState] = useState<'default' | 'error' | 'offline'>(
    isOnline ? 'default' : 'offline',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMobileState((current) => {
      if (!isOnline) {
        return 'offline';
      }
      return current === 'offline' ? 'default' : current;
    });
  }, [isOnline]);

  return (
    <E02RiderMobileScreen
      mobileState={mobileState}
      mobileValue={mobile}
      onMobileChange={(value) => {
        setMobile(clampMobileInput(value));
        if (mobileState === 'error') {
          setMobileState('default');
        }
      }}
      onBack={() => {
        void navigate(emergencyJourneyPaths.riderPrompt);
      }}
      onContinue={() => {
        if (isSubmitting) {
          return;
        }
        if (!isOnline) {
          setMobileState('offline');
          return;
        }
        if (!isValidMobile(mobile)) {
          setMobileState('error');
          return;
        }
        const normalized = normalizeMobile(mobile);
        setIsSubmitting(true);
        void requestOtp(normalized).then((result) => {
          setIsSubmitting(false);
          if (!result.ok) {
            reportEmergencyApiError(riderLogger, 'rider_otp_request_failed', result.error, { toast: false });
            setMobileState('error');
            return;
          }
          patchEmergency({
            rider: {
              mobile: normalized,
              name: emergency.rider?.name ?? '',
              relation: emergency.rider?.relation ?? 'spouse',
            },
          });
          void navigate(emergencyJourneyPaths.riderOtp);
        });
      }}
    />
  );
}

export function R2Route() {
  const navigate = useNavigate();
  const { selectedFlow } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const { verifyOtp: verifyRiderOtpApi, requestOtp: requestRiderOtpApi } = useRiders(selectedFlow);
  const mobile = emergency.rider?.mobile ?? '';
  const [otp, setOtp] = useState('');
  const [otpState, setOtpState] = useState<
    'default' | 'error' | 'verifying' | 'network-error' | 'success'
  >('default');
  const [otpErrorKind, setOtpErrorKind] = useState<'wrong' | 'expired' | null>(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const isOnline = useOnlineState();

  useEffect(() => {
    if (resendCooldownSeconds <= 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setResendCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [resendCooldownSeconds]);

  const verifyOtp = useCallback(
    (code = otp) => {
      if (!isOnline) {
        setOtpState('network-error');
        return;
      }
      if (code.length < OTP_LENGTH) {
        setOtpState('error');
        setOtpErrorKind('wrong');
        return;
      }
      setOtpState('verifying');
      void verifyRiderOtpApi(mobile, code).then((result) => {
        if (!result.ok) {
          reportEmergencyApiError(riderLogger, 'rider_otp_verify_failed', result.error, { toast: false });
          setOtpState('error');
          setOtpErrorKind(mapOtpErrorKind(result.error));
          return;
        }
        setOtpState('success');
        patchEmergency({
          rider: emergency.rider
            ? { ...emergency.rider, mobile }
            : { mobile, name: '', relation: 'spouse' },
        });
        window.setTimeout(() => {
          void navigate(emergencyJourneyPaths.riderName);
        }, VERIFY_OTP_SUCCESS_MS);
      });
    },
    [emergency.rider, isOnline, mobile, navigate, otp, patchEmergency, verifyRiderOtpApi],
  );

  return (
    <E03RiderOtpScreen
      otpState={otpState}
      mobile={mobile}
      otpValue={otp}
      onOtpChange={(value) => {
        setOtp(value);
        if (value.length === OTP_LENGTH) {
          if (otpState !== 'verifying' && otpState !== 'success') {
            verifyOtp(value);
          }
          return;
        }
        if (otpState === 'error' || otpState === 'network-error') {
          setOtpState('default');
          setOtpErrorKind(null);
        }
      }}
      otpErrorKind={otpErrorKind}
      resendCooldownSeconds={resendCooldownSeconds}
      onResendOtp={() => {
        void requestRiderOtpApi(mobile).then((result) => {
          if (!result.ok) {
            reportEmergencyApiError(riderLogger, 'rider_otp_resend_failed', result.error);
            return;
          }
          setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
          setOtpState('default');
          setOtpErrorKind(null);
        });
      }}
      onChangeNumber={() => {
        void navigate(emergencyJourneyPaths.riderMobile);
      }}
      onBack={() => {
        void navigate(emergencyJourneyPaths.riderMobile);
      }}
      onContinue={verifyOtp}
    />
  );
}

export function R3Route() {
  const navigate = useNavigate();
  const { selectedFlow } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const { addRider } = useRiders(selectedFlow);
  const isOnline = useOnlineState();
  const [name, setName] = useState(emergency.rider?.name ?? '');
  const [relation, setRelation] = useState<RelationshipId | undefined>(
    emergency.rider?.relation ?? 'spouse',
  );
  const [formState, setFormState] = useState<EmergencyNameFormState>('default');
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  return (
    <E04RiderNameScreen
      nameValue={name}
      onNameChange={(value) => {
        setName(value);
        if (formState === 'error') {
          setFormState('default');
          setApiErrorMessage(null);
        }
      }}
      relation={relation}
      onRelationChange={(value) => {
        setRelation(value);
        if (formState === 'error') {
          setFormState('default');
          setApiErrorMessage(null);
        }
      }}
      formState={formState}
      errorMessage={apiErrorMessage}
      onBack={() => {
        void navigate(emergencyJourneyPaths.riderOtp);
      }}
      onContinue={() => {
        const riderMobile = emergency.rider?.mobile;
        if (!isValidEmergencyName(name) || !relation || !riderMobile) {
          return;
        }
        if (!isOnline) {
          return;
        }
        setFormState('submitting');
        setApiErrorMessage(null);
        void addRider(name.trim(), relation).then((result) => {
          if (!result.ok) {
            const apiMessage = readEmergencyApiUserMessage(result.error);
            if (apiMessage) {
              reportEmergencyApiError(riderLogger, 'rider_create_failed', result.error, { toast: false });
              setApiErrorMessage(apiMessage);
              setFormState('error');
              return;
            }
            if (result.error.code === 'validation') {
              void navigate(emergencyJourneyPaths.riderOtp);
              return;
            }
            setFormState('default');
            return;
          }
          patchEmergency({
            rider: undefined,
            riders: result.riders,
          });
          void navigate(emergencyJourneyPaths.ridersSummary, { replace: true });
        });
      }}
    />
  );
}

export function R4Route() {
  const navigate = useNavigate();
  const { selectedFlow, setPhase } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const { planId, riderCount, flowKind } = useEmergencyFoundation();
  const { refresh: refreshRiders } = useRiders(selectedFlow);
  const riders = emergency.riders ?? [];
  const contacts = emergency.contacts ?? [];

  usePreventBrowserBack();

  useEffect(() => {
    let cancelled = false;
    void refreshRiders(true).then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      patchEmergency({ riders: result.riders });
    });
    return () => {
      cancelled = true;
    };
  }, [patchEmergency, refreshRiders]);

  if (riders.length === 0 && !emergency.rider) {
    return <Navigate to={emergencyJourneyPaths.riderName} replace />;
  }

  return (
    <E10RidersSummaryScreen
      riders={riders}
      planId={planId}
      purchasedRiderSlots={riderCount}
      flowKind={flowKind}
      showBack={false}
      onAddAnother={() => {
        if (!canAddRider(riders.length, planId, riderCount, flowKind)) {
          return;
        }
        patchEmergency({
          rider: {
            mobile: '',
            name: '',
            relation: 'spouse',
          },
        });
        void navigate(emergencyJourneyPaths.riderMobile);
      }}
      onContinue={() => {
        if (contacts.length > 0) {
          setPhase('completed');
          void navigate(getCompletedPath(), { replace: true });
          return;
        }
        void navigate(emergencyJourneyPaths.contactsEmpty);
      }}
    />
  );
}
