import { useId } from 'react';

import { cn } from '../../../utils/cn';

import type { AlInputProps } from './Input.types';
import './Input.css';

export function AlInput({
  label,
  helperText,
  errorText,
  mono = false,
  className,
  inputClassName,
  id,
  trailing,
  variant = 'default',
  disabled,
  ...props
}: AlInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const isError = variant === 'error' || Boolean(errorText);
  const isSuccess = variant === 'success' && !isError;
  const isDisabled = variant === 'disabled' || Boolean(disabled);
  const isFilled = String(props.value ?? props.defaultValue ?? '').trim().length > 0;
  const describedBy = isError ? errorId : helperText ? hintId : undefined;

  return (
    <div
      className={cn(
        'al-field',
        isError && 'al-field--error',
        isSuccess && 'al-field--success',
        isDisabled && 'al-field--disabled',
        isFilled && 'al-field--filled',
        className,
      )}
    >
      {label ? (
        <label className="al-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className="al-field__control">
        <input
          id={inputId}
          className={cn('al-field__input', mono && 'al-field__input--mono', inputClassName)}
          disabled={isDisabled}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {trailing ? <span className="al-field__trailing">{trailing}</span> : null}
      </div>
      {helperText && !isError ? (
        <span className="al-field__hint" id={hintId}>
          {helperText}
        </span>
      ) : null}
      {isError && errorText ? (
        <span className="al-field__error" id={errorId} role="alert">
          {errorText}
        </span>
      ) : null}
    </div>
  );
}
