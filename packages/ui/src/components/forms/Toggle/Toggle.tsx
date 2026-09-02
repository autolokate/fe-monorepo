import { useId } from 'react';

import { cn } from '../../../utils/cn';

import type { AlToggleProps } from './Toggle.types';
import './Toggle.css';

export function AlToggle({
  label,
  helperText,
  loading = false,
  className,
  id,
  disabled,
  ...props
}: AlToggleProps) {
  const generatedId = useId();
  const toggleId = id ?? generatedId;
  const isDisabled = Boolean(disabled) || loading;
  const hasMeta = Boolean(label || helperText);

  return (
    <label
      className={cn(
        'al-toggle',
        !hasMeta && 'al-toggle--bare',
        isDisabled && 'is-disabled',
        loading && 'is-loading',
        className,
      )}
      htmlFor={toggleId}
    >
      {hasMeta ? (
        <span className="al-toggle__meta">
          {label ? <span className="al-toggle__label">{label}</span> : null}
          {helperText ? <span className="al-toggle__hint">{helperText}</span> : null}
        </span>
      ) : null}
      <span className="al-toggle__control">
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          className="al-toggle__input"
          disabled={isDisabled}
          aria-busy={loading || undefined}
          {...props}
        />
        <span className="al-toggle__track" aria-hidden />
      </span>
    </label>
  );
}
