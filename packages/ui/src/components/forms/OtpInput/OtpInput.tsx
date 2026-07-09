import { useId, useEffect, useRef } from 'react';

import { cn } from '../../../utils/cn';

import type { AlOtpInputProps } from './OtpInput.types';
import {
  buildOtpDigits,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
} from './OtpInput.utils';
import './OtpInput.css';

export function AlOtpInput({
  length = 6,
  value,
  onChange,
  label,
  helperText,
  errorText,
  state = 'empty',
  disabled = false,
  loading = false,
  className,
}: AlOtpInputProps) {
  const baseId = useId();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = buildOtpDigits(length, value);
  const resolvedError = errorText;
  const isError = state === 'error' || Boolean(resolvedError);
  const isSuccess = state === 'success' && !isError;
  const isFilled = state === 'filled' && !isError && !isSuccess;
  const hasPartialValue = value.replace(/\D/g, '').length > 0;
  const isDisabled = disabled || (loading && !isSuccess);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    for (const input of inputsRef.current) {
      input?.blur();
    }
  }, [isSuccess]);
  const groupLabel = label ?? 'OTP input';

  return (
    <div
      className={cn(
        'al-otp-input',
        isError && 'al-otp-input--error',
        isSuccess && 'al-otp-input--success',
        isFilled && 'al-otp-input--filled',
        hasPartialValue && 'al-otp-input--has-value',
        loading && 'is-loading',
        className,
      )}
    >
      {label ? <span className="al-otp-input__label">{label}</span> : null}
      <div
        className="al-otp-input__cells"
        style={{ ['--al-otp-count' as string]: String(length) }}
        role="group"
        aria-label={groupLabel}
        aria-busy={loading || undefined}
      >
        {digits.map((digit, index) => (
          <input
            key={`${baseId}-${String(index)}`}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            className={cn(
              'al-otp-input__cell',
              digit.length > 0 && 'al-otp-input__cell--has-value',
              isSuccess && 'al-otp-input__cell--success',
            )}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={isDisabled}
            readOnly={isSuccess || undefined}
            aria-label={`Digit ${String(index + 1)} of ${String(length)}`}
            aria-invalid={isError || undefined}
            onChange={(event) => {
              handleOtpChange(digits, index, event.target.value, length, onChange, inputsRef);
            }}
            onKeyDown={(event) => {
              handleOtpKeyDown(digits, index, event, inputsRef);
            }}
            onPaste={(event) => {
              handleOtpPaste(event, length, onChange, inputsRef);
            }}
          />
        ))}
      </div>
      {helperText && !isError ? <span className="al-otp-input__hint">{helperText}</span> : null}
      {isError && resolvedError ? (
        <span className="al-otp-input__error" role="alert">
          {resolvedError}
        </span>
      ) : null}
    </div>
  );
}
