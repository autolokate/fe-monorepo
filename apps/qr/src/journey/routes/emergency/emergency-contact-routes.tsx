import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import {
  E05ContactsEmptyScreen,
  E06ContactMobileScreen,
  E07ContactOtpScreen,
  E08ContactNameScreen,
  E09ContactsSummaryScreen,
} from '../../../features/emergency/screens/index';
import {
  pickDeviceContactWithStatus,
  shouldShowAddFromContactsCTA,
} from '../../../utils/device-contact-picker';
import {
  canAddEmergencyContact,
  getContactsSummaryRiderContext,
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
import { useEmergencyContacts } from '@/hooks/emergency/index';
import { reportEmergencyApiError } from '@/platform/feedback/report-emergency-api-error';
import { emergencyContactLogger } from '@/services/emergency/emergency-contact-logger';
import type {
  EmergencyContact,
  EmergencyNameFormState,
  RelationshipId,
} from '../../../features/emergency/types';
import { getCompletedPath, getEmergencyFlowBackPath } from '../../activation-routing';
import { usePreventBrowserBack } from '@/platform/navigation/use-prevent-browser-back';
import { emergencyJourneyPaths } from '../../emergency/emergency-routing';
import { useJourney } from '../../JourneyContext';
import {
  mapOtpErrorKind,
  useEmergencyFoundation,
  useEmergencySession,
  useOnlineState,
  VERIFY_OTP_SUCCESS_MS,
} from './emergency-route-shared';

export function E0Route() {
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
  }, []);

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

export function E1Route() {
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
              { toast: false },
            );
            setMobileState('error');
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

export function E2Route() {
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
            { toast: false },
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

export function E3Route() {
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
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  return (
    <E08ContactNameScreen
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
        setApiErrorMessage(null);
        void createContact(name.trim(), relation).then((result) => {
          if (!result.ok) {
            const apiMessage = reportEmergencyApiError(
              emergencyContactLogger,
              'contact_create_failed',
              result.error,
              { toast: false },
            );
            setApiErrorMessage(apiMessage);
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

export function E5Route() {
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
