import { cn } from '../../../utils/cn';

import type { AlScannerHubCardProps } from './ScannerHubCard.types';
import './ScannerHubCard.css';

/** Figma 843:2080 · Park Me / Emergency action cards on vehicle found hub. */
export function AlScannerHubCard({
  variant,
  title,
  subtitle,
  icon,
  chevron,
  onSelect,
  className,
}: AlScannerHubCardProps) {
  return (
    <button
      type="button"
      className={cn('al-scanner-hub-card', `al-scanner-hub-card--${variant}`, className)}
      onClick={onSelect}
    >
      <span className="al-scanner-hub-card__icon-tile" aria-hidden>
        {icon}
      </span>
      <span className="al-scanner-hub-card__copy">
        <p className="al-scanner-hub-card__title">{title}</p>
        <p className="al-scanner-hub-card__subtitle">{subtitle}</p>
      </span>
      <span className="al-scanner-hub-card__chevron" aria-hidden>
        {chevron ?? (
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
