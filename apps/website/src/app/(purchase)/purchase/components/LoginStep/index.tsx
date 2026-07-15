import { useEffect, useState } from 'react';
import { Pencil, ShieldCheck } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { AlCheckbox, AlOtpInput, AlTextField } from '@autolokate/ui';
import { LegalDocumentDialog } from '@/components/legal/LegalDocumentDialog';
import { useRequestPurchaseOtp, useVerifyPurchaseOtp } from '@/hooks/otp';
import { useGrantAccountConsent } from '@/hooks/purchase';
import type { LegalDocumentKind } from '@/services/legal/legal-client-api';
import { MOBILE_LENGTH, OTP_LENGTH } from '../../constants';
import type { StepProps } from '../../types';
import { StepShell } from '../StepShell';
import styles from './index.module.css';

/** Seconds the buyer must wait before they can request a new OTP. */
const RESEND_COOLDOWN_SECONDS = 30;

export function LoginStep({ state, update, goTo }: StepProps) {
  const mobileOk = state.mobile.length === MOBILE_LENGTH;
  const otpOk = state.otp.length === OTP_LENGTH;
  const canSendOtp = mobileOk && state.accepted;

  const { mutateAsync: sendOtp, isLoading: sendingOtp } = useRequestPurchaseOtp({
    successToast: 'OTP sent',
  });
  const { mutateAsync: verifyOtp, isLoading: verifyingOtp } = useVerifyPurchaseOtp();
  const { mutateAsync: grantAccountConsent, isLoading: grantingConsent } = useGrantAccountConsent();

  // Verify may succeed while the follow-up consent grant fails — track it so a
  // retry re-runs only the failed step (the OTP is single-use).
  const [verified, setVerified] = useState(false);

  // Which legal document (if any) is open in the modal.
  const [legalDoc, setLegalDoc] = useState<LegalDocumentKind | null>(null);

  // Resend cooldown — restarts whenever an OTP is (re)sent.
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (!state.otpSent) return;
    setResendIn(RESEND_COOLDOWN_SECONDS);
    const id = window.setInterval(() => {
      setResendIn((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.otpSent]);

  const handleSendOtp = async () => {
    try {
      await sendOtp({ phone: `+91${state.mobile}` });
      update({ otpSent: true });
    } catch {
      // Error toast is surfaced by the mutation hook.
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp({ phone: `+91${state.mobile}` });
      update({ otp: '' });
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch {
      // Error toast is surfaced by the mutation hook.
    }
  };

  const handleVerify = async () => {
    try {
      if (!verified) {
        await verifyOtp({ phone: `+91${state.mobile}`, code: state.otp });
        setVerified(true);
      }
      // Record the always-on ACCOUNT (DPDP) consent, pinning the notice version
      // shown alongside the checkbox. Blocking — if it fails we stay on the step
      // so the buyer can retry (a retry re-runs only this call, not verify).
      await grantAccountConsent();
      goTo('address');
    } catch {
      // Both calls surface their own error toast ("Something went wrong…").
    }
  };

  const submittingOtp = verifyingOtp || grantingConsent;

  return (
    <StepShell
      title="Verify your number"
      subtitle="We'll send a code on WhatsApp (or SMS)"
      backLabel="Back"
      onBack={() => goTo('configure')}
    >
      <div className={styles.card}>
        {!state.otpSent ? (
          <>
            <AlTextField
              id="purchase-mobile"
              label="Mobile number"
              prefix="+91"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              helperText="OTP will be sent to this number"
              autoFocus
              value={state.mobile}
              onChange={(e) =>
                update({
                  mobile: e.target.value
                    .replace(/\D/g, '')
                    .replace(/^0+/, '')
                    .slice(0, MOBILE_LENGTH),
                })
              }
            />

            <div className={styles.consent}>
              <AlCheckbox
                id="purchase-terms"
                layout="icon-only"
                label="I agree to the Privacy Policy and Terms"
                checked={state.accepted ?? false}
                onChange={(e) => update({ accepted: e.target.checked })}
              />
              <p className={styles.consentText}>
                So Autolokate can keep you safe and run your vehicle services, I agree to the{' '}
                <button
                  type="button"
                  className={styles.consentLink}
                  onClick={() => setLegalDoc('PRIVACY_POLICY')}
                >
                  Privacy Policy
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className={styles.consentLink}
                  onClick={() => setLegalDoc('TERMS')}
                >
                  Terms
                </button>
                . You can withdraw anytime.
              </p>
            </div>

            <p className={styles.encrypted}>
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Encrypted at rest · never sold to third parties
            </p>

            {!state.accepted ? <p className={styles.gate}>Accept the terms to continue</p> : null}

            <AlButton
              size="lg"
              radius="lg"
              variant="primary"
              className={styles.action}
              disabled={!canSendOtp || sendingOtp}
              onClick={handleSendOtp}
            >
              {sendingOtp ? 'Sending…' : 'Send OTP'}
            </AlButton>
          </>
        ) : (
          <>
            <p className={styles.sentTo}>
              OTP sent to <strong>+91 {state.mobile}</strong>
              <button
                type="button"
                className={styles.edit}
                onClick={() => update({ otpSent: false, otp: '' })}
                aria-label="Edit mobile number"
                title="Edit mobile number"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            </p>
            <AlOtpInput
              label="Enter OTP"
              length={OTP_LENGTH}
              value={state.otp}
              onChange={(next) => update({ otp: next })}
            />
            <AlButton
              size="lg"
              radius="lg"
              variant="primary"
              className={styles.action}
              disabled={!otpOk || submittingOtp}
              onClick={handleVerify}
            >
              {submittingOtp ? 'Verifying…' : verified ? 'Try again' : 'Verify & continue'}
            </AlButton>
            <p className={styles.resend}>
              {resendIn > 0 ? (
                <>
                  Resend code in <span className={styles.resendTimer}>{resendIn}s</span>
                </>
              ) : (
                <>
                  Didn&apos;t get it?{' '}
                  <button
                    type="button"
                    className={styles.resendLink}
                    onClick={handleResend}
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? 'Sending…' : 'Resend'}
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>

      <LegalDocumentDialog
        kind={legalDoc ?? 'PRIVACY_POLICY'}
        open={legalDoc !== null}
        onOpenChange={(next) => {
          if (!next) setLegalDoc(null);
        }}
      />
    </StepShell>
  );
}
