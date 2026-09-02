'use client';

import { ArrowRight, Clock } from 'lucide-react';
import { OtpInput } from '../../../../../shared/components/OtpInput';
import { OTP_LENGTH } from '../../../../../shared/hooks/useVerify';
import styles from './index.module.css';

interface OtpFormProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  resendIn: number;
  onResend: () => void;
  onSendSms: () => void;
  verifying: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

/** Phase B of verify: enter the OTP, resend after cooldown, then verify. */
export function OtpForm({
  value,
  onChange,
  error,
  resendIn,
  onResend,
  onSendSms,
  verifying,
  canSubmit,
  onSubmit,
}: OtpFormProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className={styles.inner}>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus -- expected UX: focus the OTP field on open */}
        <OtpInput value={value} onChange={onChange} length={OTP_LENGTH} error={!!error} autoFocus />

        {error ? <p className={styles.errorText}>{error}</p> : null}

        <div className={styles.resend}>
          {resendIn > 0 ? (
            <span className={styles.timer}>
              <Clock className={styles.timerIcon} aria-hidden />
              Resend code in {resendIn}s
            </span>
          ) : (
            <>
              <span className={styles.resendPrompt}>Didn’t get it on WhatsApp?</span>
              <div className={styles.actions}>
                <button type="button" className={styles.link} onClick={onResend}>
                  Resend
                </button>
                <span className={styles.sep} aria-hidden>
                  ·
                </span>
                <button type="button" className={styles.link} onClick={onSendSms}>
                  Send to SMS
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <button type="submit" className={styles.cta} disabled={!canSubmit}>
        {verifying ? 'Verifying…' : 'Verify & continue'}
        {!verifying ? <ArrowRight className={styles.ctaIcon} aria-hidden /> : null}
      </button>
    </form>
  );
}
