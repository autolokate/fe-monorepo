import { useId } from 'react';

import { cn } from '../../../utils/cn.js';

import type { AlSelectProps } from './Select.types.js';
import '../Input/Input.css';
import './Select.css';

export function AlSelect({
  label,
  helperText,
  errorText,
  options,
  placeholder,
  className,
  compact = false,
  id,
  disabled,
  value,
  defaultValue,
  ...props
}: AlSelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const isError = Boolean(errorText);
  const isDisabled = Boolean(disabled);
  const isFilled = String(value ?? defaultValue ?? '').trim().length > 0;
  const describedBy = isError ? errorId : helperText ? hintId : undefined;

  return (
    <div
      className={cn(
        'al-field',
        isError && 'al-field--error',
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
        <select
          id={inputId}
          className={cn('al-field__input', 'al-select', compact && 'al-select--compact')}
          disabled={isDisabled}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
          value={value}
          defaultValue={defaultValue}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
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
