import { useId } from 'react';

import { cn } from '../../../utils/cn';

import type { AlCheckboxProps } from './Checkbox.types';
import './Checkbox.css';

export function AlCheckbox({
  label,
  helperText,
  errorText,
  layout = 'default',
  className,
  id,
  disabled,
  ...props
}: AlCheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const isIconOnly = layout === 'icon-only';

  return (
    <label
      className={cn(
        'al-checkbox',
        isIconOnly && 'al-checkbox--icon-only',
        disabled && 'is-disabled',
        className,
      )}
      htmlFor={checkboxId}
    >
      <span className="al-checkbox__control">
        <input
          id={checkboxId}
          type="checkbox"
          className="al-checkbox__input"
          disabled={disabled}
          aria-label={isIconOnly ? label : undefined}
          {...props}
        />
        <span className="al-checkbox__box" aria-hidden>
          {/* Figma 81:23 — check path exported from AlCheckbox/On */}
          <svg
            className="al-checkbox__mark"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M7.75 11L9.95 13.5L14.25 8.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      {isIconOnly ? null : (
        <span className="al-checkbox__meta">
          <span className="al-checkbox__label">{label}</span>
          {errorText ? <span className="al-checkbox__error">{errorText}</span> : null}
          {!errorText && helperText ? <span className="al-checkbox__hint">{helperText}</span> : null}
        </span>
      )}
      {isIconOnly && errorText ? (
        <span className="al-checkbox__error al-checkbox__error--icon-only">{errorText}</span>
      ) : null}
    </label>
  );
}
