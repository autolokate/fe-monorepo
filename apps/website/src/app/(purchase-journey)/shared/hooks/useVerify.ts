'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPurchaseSession,
  grantJourneyConsent,
  fromE164,
  saveJourneyProfileName,
  sendJourneyOtp,
  verifyJourneyOtp,
} from '../services/auth-api';

export const MOBILE_LENGTH = 10;
export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 30;

type Phase = 'mobile' | 'otp' | 'name';
type Async = 'idle' | 'pending' | 'error';

export interface UseVerifyOptions {
  /** Called once OTP verify, consent, and the name capture all succeed. */
  onVerified: () => void;
}

export interface UseVerifyResult {
  phase: Phase;
  mobile: string;
  setMobile: (next: string) => void;
  mobileValid: boolean;
  mobileError: string | null;
  accepted: boolean;
  setAccepted: (next: boolean) => void;
  otp: string;
  setOtp: (next: string) => void;
  otpValid: boolean;
  otpError: string | null;
  name: string;
  setName: (next: string) => void;
  nameValid: boolean;
  nameError: string | null;
  savingName: boolean;
  canSaveName: boolean;
  submitName: () => void;
  sending: boolean;
  verifying: boolean;
  resendIn: number;
  canSend: boolean;
  canVerify: boolean;
  sendOtp: () => void;
  resendOtp: () => void;
  verify: () => void;
  changeMobile: () => void;
}

function initialMobile(): string {
  return fromE164(getPurchaseSession()?.phone);
}

/**
 * Drives the two-phase verify step (mobile → OTP) against the purchase OTP
 * services. Owns the resend cooldown, dedupes an already-verified OTP so a
 * failed consent grant can be retried without re-entering the code, and maps
 * failures to the inline messages the design calls for.
 */
export function useVerify({ onVerified }: UseVerifyOptions): UseVerifyResult {
  const [phase, setPhase] = useState<Phase>('mobile');
  const [mobile, setMobileRaw] = useState<string>(initialMobile);
  const [accepted, setAccepted] = useState(false);
  const [otp, setOtpRaw] = useState('');

  const [sendStatus, setSendStatus] = useState<Async>('idle');
  const [mobileError, setMobileError] = useState<string | null>(null);

  const [verifyStatus, setVerifyStatus] = useState<Async>('idle');
  const [otpError, setOtpError] = useState<string | null>(null);

  const [name, setNameRaw] = useState('');
  const [nameStatus, setNameStatus] = useState<Async>('idle');
  const [nameError, setNameError] = useState<string | null>(null);

  const [resendIn, setResendIn] = useState(0);
  // OTP verified but the follow-up consent grant may have failed — lets us retry
  // consent without asking the buyer to re-enter a now-consumed code.
  const otpVerifiedRef = useRef(false);

  const mobileValid = mobile.length === MOBILE_LENGTH;
  const otpValid = otp.length === OTP_LENGTH;
  const nameValid = name.trim().length > 0;

  const setMobile = useCallback((next: string) => {
    setMobileRaw(next.replace(/\D/g, '').slice(0, MOBILE_LENGTH));
    setMobileError(null);
  }, []);

  const setOtp = useCallback((next: string) => {
    setOtpRaw(next.replace(/\D/g, '').slice(0, OTP_LENGTH));
    setOtpError(null);
  }, []);

  const setName = useCallback((next: string) => {
    setNameRaw(next);
    setNameError(null);
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => {
      setResendIn((s) => s - 1);
    }, 1000);
    return () => {
      window.clearTimeout(id);
    };
  }, [resendIn]);

  const doSend = useCallback(
    async (isResend: boolean) => {
      setSendStatus('pending');
      try {
        await sendJourneyOtp(mobile);
        setSendStatus('idle');
        setOtpRaw('');
        setOtpError(null);
        otpVerifiedRef.current = false;
        setResendIn(RESEND_COOLDOWN_SECONDS);
        if (!isResend) setPhase('otp');
      } catch {
        setSendStatus('error');
        if (isResend) setOtpError('Couldn’t resend the code. Try again.');
        else setMobileError('Couldn’t send the code. Try again.');
      }
    },
    [mobile],
  );

  const sendOtp = useCallback(() => {
    if (!mobileValid) {
      setMobileError('Enter a valid 10-digit number');
      return;
    }
    if (!accepted || sendStatus === 'pending') return;
    void doSend(false);
  }, [mobileValid, accepted, sendStatus, doSend]);

  const resendOtp = useCallback(() => {
    if (resendIn > 0 || sendStatus === 'pending') return;
    void doSend(true);
  }, [resendIn, sendStatus, doSend]);

  const verify = useCallback(() => {
    if (!otpValid || verifyStatus === 'pending') return;
    void (async () => {
      setVerifyStatus('pending');
      setOtpError(null);
      try {
        if (!otpVerifiedRef.current) {
          await verifyJourneyOtp(mobile, otp);
          otpVerifiedRef.current = true;
        }
        await grantJourneyConsent();
        setVerifyStatus('idle');
        // Number confirmed — collect the buyer's name before handing off.
        setPhase('name');
      } catch {
        setVerifyStatus('error');
        setOtpError(
          otpVerifiedRef.current
            ? 'Something went wrong. Try again.'
            : 'That code didn’t match. Check and try again',
        );
      }
    })();
  }, [otpValid, verifyStatus, mobile, otp]);

  const submitName = useCallback(() => {
    if (!nameValid || nameStatus === 'pending') return;
    void (async () => {
      setNameStatus('pending');
      setNameError(null);
      try {
        await saveJourneyProfileName(name.trim());
        setNameStatus('idle');
        onVerified();
      } catch {
        setNameStatus('error');
        setNameError('Couldn’t save your name. Try again.');
      }
    })();
  }, [nameValid, nameStatus, name, onVerified]);

  const changeMobile = useCallback(() => {
    setPhase('mobile');
    setOtpRaw('');
    setOtpError(null);
    otpVerifiedRef.current = false;
  }, []);

  return {
    phase,
    mobile,
    setMobile,
    mobileValid,
    mobileError,
    accepted,
    setAccepted,
    otp,
    setOtp,
    otpValid,
    otpError,
    name,
    setName,
    nameValid,
    nameError,
    savingName: nameStatus === 'pending',
    canSaveName: nameValid && nameStatus !== 'pending',
    submitName,
    sending: sendStatus === 'pending',
    verifying: verifyStatus === 'pending',
    resendIn,
    canSend: mobileValid && accepted && sendStatus !== 'pending',
    canVerify: otpValid && verifyStatus !== 'pending',
    sendOtp,
    resendOtp,
    verify,
    changeMobile,
  };
}
