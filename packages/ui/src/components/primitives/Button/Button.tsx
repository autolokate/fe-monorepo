import { cn } from '../../../utils/cn';

import type { AlButtonProps } from './Button.types';
import { normalizeButtonSize, normalizeButtonVariant } from './Button.utils';
import './Button.css';

function Spinner() {
  return <span className="al-button__spinner" aria-hidden />;
}

export function AlButton({
  variant = 'primary',
  size = 'md',
  radius,
  loading = false,
  icon,
  iconPosition = 'start',
  className,
  type = 'button',
  children,
  disabled,
  ...props
}: AlButtonProps) {
  const normalizedVariant = normalizeButtonVariant(variant);
  const normalizedSize = normalizeButtonSize(size);

  return (
    <button
      type={type}
      className={cn(
        'al-button',
        `al-button--${normalizedVariant}`,
        `al-button--${normalizedSize}`,
        radius ? `al-button--radius-${radius}` : undefined,
        loading && 'is-loading',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      <span className="al-button__content">
        {icon && iconPosition === 'start' ? (
          <span className="al-button__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        {children}
        {icon && iconPosition === 'end' ? (
          <span className="al-button__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
      </span>
      {loading ? <span className="al-button__sr">Loading</span> : null}
    </button>
  );
}
