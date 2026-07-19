'use client';

import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LegalDocumentKind } from '@/services/legal/legal-client-api';
import { COUNTRY_CODE } from '../../../../../shared/services/auth-api';
import { MOBILE_LENGTH } from '../../../../../shared/hooks/useVerify';
import styles from './index.module.css';

interface MobileFormProps {
  mobile: string;
  onMobileChange: (value: string) => void;
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  error: string | null;
  sending: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onOpenLegal: (kind: LegalDocumentKind) => void;
}

/** Phase A of verify: enter mobile number + accept terms, then request an OTP. */
export function MobileForm({
  mobile,
  onMobileChange,
  accepted,
  onAcceptedChange,
  error,
  sending,
  canSubmit,
  onSubmit,
  onOpenLegal,
}: MobileFormProps) {
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
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="journey-mobile">
            Mobile number
          </label>
          <div className={cn(styles.field, error && styles.fieldError)}>
            <span className={styles.prefix}>{COUNTRY_CODE}</span>
            <span className={styles.divider} aria-hidden />
            <input
              id="journey-mobile"
              className={styles.input}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={MOBILE_LENGTH}
              placeholder="98765 43210"
              value={mobile}
              onChange={(e) => {
                onMobileChange(e.target.value);
              }}
            />
          </div>
          <p className={cn(styles.helper, error && styles.helperError)}>
            {error ?? 'We’ll send a code on WhatsApp'}
          </p>
        </div>

        <div className={styles.consent}>
          <button
            type="button"
            role="checkbox"
            aria-checked={accepted}
            aria-label="I agree to the Privacy policy and Terms"
            className={cn(styles.checkbox, accepted && styles.checkboxOn)}
            onClick={() => {
              onAcceptedChange(!accepted);
            }}
          >
            {accepted ? <Check className={styles.checkIcon} aria-hidden /> : null}
          </button>
          <span className={styles.consentText}>
            I agree to the{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => {
                onOpenLegal('PRIVACY_POLICY');
              }}
            >
              Privacy policy
            </button>{' '}
            and{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => {
                onOpenLegal('TERMS');
              }}
            >
              Terms
            </button>
          </span>
        </div>
      </div>

      <button type="submit" className={styles.cta} disabled={!canSubmit}>
        {sending ? 'Sending…' : 'Send OTP'}
        {!sending ? <ArrowRight className={styles.ctaIcon} aria-hidden /> : null}
      </button>
    </form>
  );
}
