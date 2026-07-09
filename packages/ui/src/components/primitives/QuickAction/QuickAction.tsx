import { cn } from '../../../utils/cn';

import type { AlQuickActionProps } from './QuickAction.types';
import './QuickAction.css';

export function AlQuickAction({
  label,
  icon,
  loading = false,
  className,
  type = 'button',
  disabled,
  ...props
}: AlQuickActionProps) {
  return (
    <button
      type={type}
      className={cn('al-quick-action', loading && 'is-loading', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={label}
      {...props}
    >
      <span className="al-quick-action__icon" aria-hidden>
        {loading ? <span className="al-quick-action__spinner" /> : icon}
      </span>
      <span className="al-quick-action__label">{label}</span>
    </button>
  );
}
