import { AlOtpInput } from '@autolokate/ui';

import { FlowStepShell, type FlowStepCaptureProgress } from '@/components/flow-step-shell/index.js';
import { isExpiredOtp, isValidOtp } from '@/features/shared-auth/auth-flow/auth-flow.demo.js';
import { OTP_LENGTH } from '@/features/shared-auth/auth-flow/auth-flow.validation.js';
import { formatMobileLocal } from '@/shared/format-mobile.js';
import type { EmergencyOtpState, EmergencyScreenNavigationProps } from '../../types.js';

import '@/components/auth-step-shell/auth-step-shell.css';
import '../../emergency.css';

export type EmergencyOtpScreenProps = EmergencyScreenNavigationProps & {
  otpState?: EmergencyOtpState;
  step: number;
  captureProgress?: FlowStepCaptureProgress;
  mobile: string;
  otpValue?: string;
  onOtpChange?: (otp: string) => void;
  otpErrorKind?: 'wrong' | 'expired' | null;
  resendCooldownSeconds?: number;
  onResendOtp?: () => void;
  onChangeNumber?: () => void;
};

/** R2 / E2 OTP — Figma 789:2109 · 789:2027 */
export function EmergencyOtpScreen({
  otpState = 'default',
  step,
  captureProgress = { step: 2, total: 3 },
  mobile,
  otpValue = '',
  onOtpChange,
  otpErrorKind = null,
  resendCooldownSeconds = 0,
  onResendOtp,
  onChangeNumber,
  onContinue,
  onBack,
  showBack = true,
}: EmergencyOtpScreenProps) {
  const verifying = otpState === 'verifying';
  const isSuccess = otpState === 'success';
  const isNetworkError = otpState === 'network-error';
  const isWrong =
    otpState === 'error' || otpErrorKind === 'wrong' || otpErrorKind === 'expired';
  const isComplete = otpValue.length === OTP_LENGTH;
  const isAutoExpired = isComplete && isExpiredOtp(otpValue);
  const isAutoWrong = isComplete && !isValidOtp(otpValue) && !isExpiredOtp(otpValue);
  const canResend = Boolean(onResendOtp) && resendCooldownSeconds === 0 && !verifying && !isSuccess;

  const otpInputState = isSuccess
    ? 'success'
    : isWrong || isNetworkError || isAutoExpired || isAutoWrong
      ? 'error'
      : 'empty';

  const errorText =
    otpErrorKind === 'expired' || isAutoExpired
      ? 'This code has expired. Request a new OTP.'
      : isWrong || isAutoWrong
        ? 'Incorrect code. Try again.'
        : isNetworkError
          ? 'Couldn’t reach the server. Tap Verify to retry.'
          : undefined;

  const resendCountdown =
    resendCooldownSeconds > 0
      ? `Resend code in 0:${String(resendCooldownSeconds).padStart(2, '0')}`
      : undefined;

  return (
    <FlowStepShell
      phase="emergency"
      step={step}
      title="Enter their code"
      description={
        <p className="ob-emergency-otp-desc">
          Sent to them on WhatsApp · {formatMobileLocal(mobile)}
          {onChangeNumber ? (
            <>
              {' '}
              <button type="button" className="ob-emergency-otp-desc__change" onClick={onChangeNumber}>
                Change
              </button>
            </>
          ) : null}
        </p>
      }
      footerLabel="Verify"
      footerLoading={verifying}
      footerDisabled={isSuccess || verifying || otpValue.length < OTP_LENGTH}
      hideFooter={isSuccess}
      captureProgress={captureProgress}
      bodyGap="otp"
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <AlOtpInput
        className="ob-auth-otp-input"
        length={OTP_LENGTH}
        value={otpValue}
        onChange={onOtpChange ?? (() => undefined)}
        state={otpInputState}
        loading={verifying}
        disabled={verifying || isSuccess}
      />
      <div className="ob-emergency-otp-status">
        {errorText && (isWrong || isNetworkError || isAutoWrong || isAutoExpired) ? (
          <p className="ob-otp-validation-error" role="alert">
            {errorText}
          </p>
        ) : null}
        {canResend ? (
          <button type="button" className="ob-emergency-otp-resend-link" onClick={onResendOtp}>
            Resend code
          </button>
        ) : resendCountdown ? (
          <p className="ob-auth-otp-countdown">{resendCountdown}</p>
        ) : null}
      </div>
    </FlowStepShell>
  );
}
