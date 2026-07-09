import { cn } from '../../../utils/cn';

import type { AlChipProps } from './Chip.types';
import './Chip.css';

export function AlChip({
  variant = 'neutral',
  label,
  icon,
  className,
  children,
  onClick,
  ...rest
}: AlChipProps) {
  const content = label ?? children;
  const isInteractive = typeof onClick === 'function';

  const chipClassName = cn(
    'al-chip',
    `al-chip--${variant}`,
    isInteractive && 'al-chip--interactive',
    className,
  );

  const chipContent = (
    <>
      {icon ? <span className="al-chip__icon">{icon}</span> : <span className="al-chip__dot" aria-hidden />}
      <span className="al-chip__label">{content}</span>
    </>
  );

  if (isInteractive) {
    return (
      <button type="button" className={chipClassName} onClick={onClick} {...rest}>
        {chipContent}
      </button>
    );
  }

  return (
    <span className={chipClassName} {...rest}>
      {chipContent}
    </span>
  );
}
