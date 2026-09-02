import { AlOtpInput } from '@autolokate/ui';

import { AuthStepShell } from '@/components/auth-step-shell/index';
import { useAuthRouteProgress } from '@/journey/progress/index';
import { AlSmsFallback } from '@/components/compositions/index';
import { formatMobileLocal } from '@/shared/format-mobile';
import { OTP_LENGTH } from '../../auth-flow/auth-flow.validation';
import type { A2OtpScreenProps } from '../../types';

/** A2 · OTP — Figma 103:324 · 557:1647 */
export function A2OtpScreen({
  otpState = 'default',
  mobile,
  otpValue = '',
  onOtpChange,
  otpErrorKind = null,
  resendCooldownSeconds = 0,
  onResendOtp,
  onSmsFallback,
  onChangeNumber,
  onContinue,
  onBack,
  showBack = true,
  title = 'Enter the 6-digit code',
}: A2OtpScreenProps) {
  const verifying = otpState === 'verifying';
  const isSuccess = otpState === 'success';
  const isNetworkError = otpState === 'network-error';
  const isResendFailed = otpState === 'resend-failed';
  const isWrong = otpState === 'error' || otpErrorKind === 'wrong' || otpErrorKind === 'expired';
  const isOffline = otpState === 'offline';
  const canResend = Boolean(onResendOtp) && resendCooldownSeconds === 0 && !verifying && !isOffline;
  const showSmsFallback =
    isWrong || isNetworkError || isResendFailed || otpState === 'resend' || canResend;

  const otpInputState = isSuccess
    ? 'success'
    : isWrong || isNetworkError || isResendFailed
      ? 'error'
      : 'empty';

  const errorText =
    otpErrorKind === 'expired'
      ? 'This code has expired. Request a new OTP.'
      : isWrong
        ? 'Incorrect code, try again'
        : isNetworkError
          ? "Couldn't reach the server, tap Verify to retry"
          : undefined;

  const resendCountdown =
    resendCooldownSeconds > 0
      ? `Resend code in 0:${String(resendCooldownSeconds).padStart(2, '0')}`
      : undefined;

  const shellVariant = isWrong || isNetworkError || isResendFailed ? 'error' : 'default';
  const progressConfig = useAuthRouteProgress();

  return (
    <AuthStepShell
      progressConfig={progressConfig}
      title={title}
      description={
        <p className="ob-auth-otp-desc">
          Sent on WhatsApp to {formatMobileLocal(mobile)}
          {onChangeNumber ? (
            <>
              {' '}
              <button type="button" className="ob-auth-otp-desc__change" onClick={onChangeNumber}>
                Change
              </button>
            </>
          ) : null}
        </p>
      }
      footerLabel="Verify"
      footerLoading={verifying}
      footerDisabled={isSuccess || verifying || isOffline || otpValue.length < OTP_LENGTH}
      hideFooter={isSuccess}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      variant={shellVariant}
      contentGap="otp"
    >
      <AlOtpInput
        className="ob-auth-otp-input"
        length={OTP_LENGTH}
        value={otpValue}
        onChange={onOtpChange ?? (() => undefined)}
        state={otpInputState}
        loading={verifying}
        disabled={verifying || isOffline || isSuccess}
      />
      <div className="ob-auth-otp-status">
        {isResendFailed ? (
          <p className="ob-auth-resend-failed">
            Couldn&apos;t resend, check your connection and try again
          </p>
        ) : null}
        {errorText && (isWrong || isNetworkError) ? (
          <p className="ob-otp-validation-error" role="alert">
            {errorText}
          </p>
        ) : null}
        {canResend ? (
          <button type="button" className="ob-auth-otp-resend-link" onClick={onResendOtp}>
            Resend code
          </button>
        ) : resendCountdown ? (
          <p className="ob-auth-otp-countdown">{resendCountdown}</p>
        ) : null}
        {showSmsFallback && onSmsFallback ? (
          <AlSmsFallback onSmsClick={onSmsFallback} disabled={verifying || isOffline} />
        ) : null}
      </div>
    </AuthStepShell>
  );
}
