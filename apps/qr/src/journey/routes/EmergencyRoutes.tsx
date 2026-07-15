import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AlPermissionSheet } from '@autolokate/ui';

import {
  E01RiderPromptScreen,
  E02RiderMobileScreen,
  E03RiderOtpScreen,
  E04RiderNameScreen,
  E05ContactsEmptyScreen,
  E06ContactMobileScreen,
  E07ContactOtpScreen,
  E08ContactNameScreen,
  E09ContactsSummaryScreen,
  E10RidersSummaryScreen,
} from '../../features/emergency/screens/index';
import {
  pickDeviceContactWithStatus,
  shouldShowAddFromContactsCTA,
} from '../../utils/device-contact-picker';
import {
  canAddEmergencyContact,
  canAddRider,
  getContactsSummaryRiderContext,
  getEntitledRiderSlots,
  getRiderPromptDescription,
  shouldEnterRiderPrompt,
} from '../../features/emergency/emergency-limits';
import {
  isValidEmergencyName,
  isValidMobile,
  normalizeMobile,
  clampMobileInput,
} from '../../features/emergency/emergency.validation';
import {
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
} from '../../features/shared-auth/auth-flow/auth-flow.validation';
import { useEmergencyContacts, useRiders } from '@/hooks/emergency/index';
import { reportEmergencyApiError } from '@/platform/feedback/report-emergency-api-error';
import type { EmergencyApiError } from '@/services/emergency/emergency-api-errors';
import { readEmergencyApiUserMessage } from '@/services/emergency/emergency-api-errors';
import { emergencyContactLogger } from '@/services/emergency/emergency-contact-logger';
import { riderLogger } from '@/services/rider/rider-logger';
import type { PurchaseCheckoutSession } from '../../features/qr-purchase/types-checkout';
import type {
  EmergencyContact,
  EmergencyNameFormState,
  EmergencyRiderPromptState,
  EmergencySession,
  RelationshipId,
} from '../../features/emergency/types';
import { getCompletedPath, getEmergencyFlowBackPath } from '../activation-routing';
import { usePreventBrowserBack } from '@/platform/navigation/use-prevent-browser-back';
import { resolveEmergencyFoundationContext } from '../emergency/emergency-foundation';
import { emergencyJourneyPaths } from '../emergency/emergency-routing';
import { useJourney } from '../JourneyContext';

function mapOtpErrorKind(error: EmergencyApiError): 'wrong' | 'expired' {
  if (error.code === 'unauthorized') {
    return 'expired';
  }
  return 'wrong';
}

const VERIFY_OTP_SUCCESS_MS = 400;

function EmergencySegmentBootstrap({ children }: { children: ReactNode }) {
  const { setPhase } = useJourney();

  useEffect(() => {
    setPhase('emergency');
  }, [setPhase]);

  return children;
}

function useEmergencySession() {
  const { session, updateSession } = useJourney();
  const emergency = session.emergency ?? {};
  const emergencyRef = useRef(emergency);
  emergencyRef.current = emergency;

  const patchEmergency = useCallback(
    (patch: Partial<EmergencySession>) => {
      updateSession({
        emergency: {
          ...emergencyRef.current,
          ...patch,
        },
      });
    },
    [updateSession],
  );

  return { emergency, patchEmergency };
}

function useEmergencyFoundation() {
  const { session, selectedFlow } = useJourney();
  return resolveEmergencyFoundationContext(session, selectedFlow);
}

function useOnlineState() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

function LegacyRiderSetupRedirect() {
  return <Navigate to={emergencyJourneyPaths.riderPrompt} replace />;
}

function hasRiderEntitlementInPurchaseSession(
  purchase: PurchaseCheckoutSession | undefined,
): boolean {
  return purchase?.selectedPlanId !== undefined && purchase.riderCount !== undefined;
}

function resolveR0InitialViewState(
  isOnline: boolean,
  loadFailed: boolean,
  purchase: PurchaseCheckoutSession | undefined,
): EmergencyRiderPromptState {
  if (!isOnline) {
    return 'offline';
  }
  if (loadFailed) {
    return 'error';
  }
  if (hasRiderEntitlementInPurchaseSession(purchase)) {
    return 'default';
  }
  return 'loading';
}

const RIDER_SKIP_CONFIRM_TITLE = 'Continue without adding a rider?';
const RIDER_SKIP_CONFIRM_BODY =
  'You can always add riders later from your vehicle profile. Adding a rider allows another trusted person to receive emergency alerts and access plan benefits.';

function R0Route() {
  const navigate = useNavigate();
  const { selectedFlow, session, setPhase } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const purchase = session.purchase;
  const { planId, riderCount, flowKind } = useEmergencyFoundation();
  const { refresh: refreshRiders } = useRiders(selectedFlow);
  const isOnline = useOnlineState();
  const entitledSlots = getEntitledRiderSlots(planId, riderCount, flowKind);
  const [viewState, setViewState] = useState<EmergencyRiderPromptState>(() =>
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
          reportEmergencyApiError(riderLogger, 'riders_load_failed', result.error);
          setApiErrorMessage(apiMessage);
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
          if (viewState === 'error' && apiErrorMessage) {
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

function R1Route() {
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
            reportEmergencyApiError(riderLogger, 'rider_otp_request_failed', result.error);
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

function R2Route() {
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
          reportEmergencyApiError(riderLogger, 'rider_otp_verify_failed', result.error);
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

function R3Route() {
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
              reportEmergencyApiError(riderLogger, 'rider_create_failed', result.error);
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

function R4Route() {
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

function E0Route() {
  const navigate = useNavigate();
  const { selectedFlow, session } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const { planId, riderCount, flowKind } = useEmergencyFoundation();
  const { refresh: refreshContacts } = useEmergencyContacts();
  const showAddFromContacts = shouldShowAddFromContactsCTA();

  useEffect(() => {
    let cancelled = false;
    void refreshContacts(false).then((result) => {
      if (cancelled || !result.ok) {
        if (!cancelled) {
          patchEmergency({ contacts: [] });
        }
        return;
      }
      patchEmergency({ contacts: result.contacts });
      if (result.contacts.length > 0) {
        void navigate(emergencyJourneyPaths.contactsSummary, { replace: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, patchEmergency, refreshContacts]);

  const goToManualEntry = useCallback(() => {
    void navigate(emergencyJourneyPaths.contactMobile);
    patchEmergency({ contactDraft: { fromPicker: false, otpVerified: false } });
  }, [navigate, patchEmergency]);

  const applyPickedContact = useCallback(
    (picked: { name: string; mobile: string }) => {
      patchEmergency({
        contactDraft: {
          name: picked.name,
          mobile: picked.mobile,
          fromPicker: true,
          otpVerified: false,
        },
      });
      void navigate(emergencyJourneyPaths.contactMobile);
    },
    [navigate, patchEmergency],
  );

  const handlePickFromContacts = useCallback(() => {
    void (async () => {
      const result = await pickDeviceContactWithStatus();
      if (result.outcome === 'picked') {
        applyPickedContact(result.contact);
        return;
      }
      if (result.outcome === 'cancelled') {
        return;
      }
      goToManualEntry();
    })();
  }, [applyPickedContact, goToManualEntry]);

  if (emergency.riderSkipped) {
    return <Navigate to={getCompletedPath()} replace />;
  }

  return (
    <E05ContactsEmptyScreen
      showAddFromContacts={showAddFromContacts}
      onBack={() => {
        const contactCount = emergency.contacts?.length ?? 0;
        if (selectedFlow === 'purchase' && contactCount === 0) {
          void navigate(getEmergencyFlowBackPath(selectedFlow, session));
          return;
        }
        if (emergency.riderSkipped) {
          void navigate(getCompletedPath(), { replace: true });
          return;
        }
        const riders = emergency.riders ?? (emergency.rider ? [emergency.rider] : []);
        if (riders.length > 0) {
          void navigate(emergencyJourneyPaths.ridersSummary, { replace: true });
          return;
        }
        if (shouldEnterRiderPrompt(planId, riderCount, flowKind)) {
          void navigate(emergencyJourneyPaths.riderPrompt);
          return;
        }
        void navigate(getEmergencyFlowBackPath(selectedFlow, session));
      }}
      onContinue={showAddFromContacts ? handlePickFromContacts : goToManualEntry}
      onFooterSecondary={goToManualEntry}
    />
  );
}

function E1Route() {
  const navigate = useNavigate();
  const { emergency, patchEmergency } = useEmergencySession();
  const { requestOtp } = useEmergencyContacts();
  const isOnline = useOnlineState();
  const [mobile, setMobile] = useState(emergency.contactDraft?.mobile ?? '');
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
    <E06ContactMobileScreen
      mobileState={mobileState}
      mobileValue={mobile}
      footerLoading={isSubmitting}
      onMobileChange={(value) => {
        setMobile(clampMobileInput(value));
        if (mobileState === 'error') {
          setMobileState('default');
        }
      }}
      onBack={() => {
        const backPath =
          (emergency.contacts?.length ?? 0) > 0
            ? emergencyJourneyPaths.contactsSummary
            : emergencyJourneyPaths.contactsEmpty;
        void navigate(backPath);
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
            reportEmergencyApiError(
              emergencyContactLogger,
              'contact_otp_request_failed',
              result.error,
            );
            return;
          }
          patchEmergency({
            contactDraft: {
              ...emergency.contactDraft,
              mobile: normalized,
              otpVerified: false,
            },
          });
          void navigate(emergencyJourneyPaths.contactOtp);
        });
      }}
    />
  );
}

function E2Route() {
  const navigate = useNavigate();
  const { emergency, patchEmergency } = useEmergencySession();
  const { verifyOtp: verifyContactOtpApi, requestOtp: requestContactOtpApi } =
    useEmergencyContacts();
  const mobile = emergency.contactDraft?.mobile ?? '';
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
      void verifyContactOtpApi(mobile, code).then((result) => {
        if (!result.ok) {
          reportEmergencyApiError(
            emergencyContactLogger,
            'contact_otp_verify_failed',
            result.error,
          );
          setOtpState('error');
          setOtpErrorKind(mapOtpErrorKind(result.error));
          return;
        }
        setOtpState('success');
        patchEmergency({
          contactDraft: {
            ...emergency.contactDraft,
            mobile,
            otpVerified: true,
          },
        });
        window.setTimeout(() => {
          void navigate(emergencyJourneyPaths.contactName);
        }, VERIFY_OTP_SUCCESS_MS);
      });
    },
    [emergency.contactDraft, isOnline, mobile, navigate, otp, patchEmergency, verifyContactOtpApi],
  );

  if (!mobile) {
    return <Navigate to={emergencyJourneyPaths.contactMobile} replace />;
  }

  return (
    <E07ContactOtpScreen
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
        void requestContactOtpApi(mobile).then((result) => {
          if (!result.ok) {
            reportEmergencyApiError(
              emergencyContactLogger,
              'contact_otp_resend_failed',
              result.error,
            );
            return;
          }
          setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
          setOtpState('default');
          setOtpErrorKind(null);
        });
      }}
      onChangeNumber={() => {
        void navigate(emergencyJourneyPaths.contactMobile);
      }}
      onBack={() => {
        void navigate(emergencyJourneyPaths.contactMobile);
      }}
      onContinue={verifyOtp}
    />
  );
}

function E3Route() {
  const navigate = useNavigate();
  const { emergency, patchEmergency } = useEmergencySession();
  const { createContact } = useEmergencyContacts();
  const isOnline = useOnlineState();
  const draft = emergency.contactDraft;
  const [name, setName] = useState(draft?.name ?? '');
  const [relation, setRelation] = useState<RelationshipId | undefined>(
    draft?.relation ?? (draft?.fromPicker ? undefined : 'spouse'),
  );
  const [formState, setFormState] = useState<EmergencyNameFormState>('default');

  return (
    <E08ContactNameScreen
      nameValue={name}
      onNameChange={(value) => {
        setName(value);
        if (formState === 'error') {
          setFormState('default');
        }
      }}
      relation={relation}
      onRelationChange={setRelation}
      formState={formState}
      onBack={() => {
        void navigate(emergencyJourneyPaths.contactOtp);
      }}
      onContinue={() => {
        const mobile = draft?.mobile;
        if (!draft || !isValidEmergencyName(name) || !relation || !mobile) {
          return;
        }
        if (!isOnline) {
          setFormState('error');
          return;
        }
        if (!draft.otpVerified) {
          void navigate(emergencyJourneyPaths.contactOtp);
          return;
        }
        setFormState('submitting');
        void createContact(name.trim(), relation).then((result) => {
          if (!result.ok) {
            reportEmergencyApiError(emergencyContactLogger, 'contact_create_failed', result.error);
            setFormState('error');
            return;
          }
          patchEmergency({
            contacts: result.contacts,
            contactDraft: undefined,
          });
          void navigate(emergencyJourneyPaths.contactsSummary, { replace: true });
        });
      }}
    />
  );
}

function E5Route() {
  const navigate = useNavigate();
  const { setPhase } = useJourney();
  const { emergency, patchEmergency } = useEmergencySession();
  const { planId, riderCount, flowKind } = useEmergencyFoundation();
  const { refresh: refreshContacts } = useEmergencyContacts();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const riders = emergency.riders ?? [];
  const riderContext = getContactsSummaryRiderContext(
    planId,
    riderCount,
    riders.length,
    emergency.riderSkipped,
    flowKind,
  );

  usePreventBrowserBack();

  useEffect(() => {
    if (emergency.contacts !== undefined) {
      setContacts(emergency.contacts);
      return;
    }

    let cancelled = false;
    void refreshContacts(false).then((result) => {
      if (cancelled) {
        return;
      }
      const nextContacts = result.ok ? result.contacts : [];
      setContacts(nextContacts);
      patchEmergency({ contacts: nextContacts });
    });
    return () => {
      cancelled = true;
    };
  }, [emergency.contacts, patchEmergency, refreshContacts]);

  const goToRiderSetup = () => {
    patchEmergency({ riderSkipped: false });
    if (riders.length === 0) {
      void navigate(emergencyJourneyPaths.riderPrompt);
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
  };

  return (
    <E09ContactsSummaryScreen
      contacts={contacts}
      planId={planId}
      showBack={false}
      onAddAnother={() => {
        if (!canAddEmergencyContact(contacts.length, planId)) {
          return;
        }
        patchEmergency({ contactDraft: { fromPicker: false, otpVerified: false } });
        void navigate(emergencyJourneyPaths.contactMobile);
      }}
      onContinue={() => {
        if (riderContext.shouldEnterRiderFlowOnContinue) {
          goToRiderSetup();
          return;
        }
        setPhase('completed');
        void navigate(getCompletedPath(), { replace: true });
      }}
    />
  );
}

function EmergencyWildcardRedirect() {
  const { session, selectedFlow } = useJourney();
  const emergency = session.emergency ?? {};
  const { planId, riderCount, flowKind } = resolveEmergencyFoundationContext(session, selectedFlow);

  if (emergency.riderSkipped) {
    return <Navigate to={getCompletedPath()} replace />;
  }

  if (selectedFlow === 'purchase' && session.purchase?.paymentStatus === 'success') {
    return <Navigate to={emergencyJourneyPaths.contactsEmpty} replace />;
  }

  if (!shouldEnterRiderPrompt(planId, riderCount, flowKind)) {
    return <Navigate to={emergencyJourneyPaths.contactsEmpty} replace />;
  }

  return <Navigate to={emergencyJourneyPaths.riderPrompt} replace />;
}

export function EmergencyRoutes() {
  return (
    <EmergencySegmentBootstrap>
      <Routes>
        <Route path="rider-setup" element={<LegacyRiderSetupRedirect />} />
        <Route path="rider-prompt" element={<R0Route />} />
        <Route path="rider-mobile" element={<R1Route />} />
        <Route path="rider-otp" element={<R2Route />} />
        <Route path="rider-name" element={<R3Route />} />
        <Route path="riders-summary" element={<R4Route />} />
        <Route path="contacts-empty" element={<E0Route />} />
        <Route path="contact-mobile" element={<E1Route />} />
        <Route path="contact-otp" element={<E2Route />} />
        <Route path="contact-name" element={<E3Route />} />
        <Route path="contacts-summary" element={<E5Route />} />
        <Route path="*" element={<EmergencyWildcardRedirect />} />
      </Routes>
    </EmergencySegmentBootstrap>
  );
}
