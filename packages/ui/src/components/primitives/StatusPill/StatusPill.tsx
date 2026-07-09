import { cn } from '../../../utils/cn';

import type { AlStatusPillProps } from './StatusPill.types';
import './StatusPill.css';

export function AlStatusPill({ label, variant, className, ...props }: AlStatusPillProps) {
  return (
    <span className={cn('al-status-pill', `al-status-pill--${variant}`, className)} {...props}>
      <span className="al-status-pill__dot" aria-hidden />
      <span className="al-status-pill__label">{label}</span>
    </span>
  );
}
