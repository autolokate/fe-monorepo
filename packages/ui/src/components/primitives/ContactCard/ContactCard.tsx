import { cn } from '../../../utils/cn';

import type { AlContactCardProps } from './ContactCard.types';
import './ContactCard.css';

/** Figma AlContactCard — 723:2194 */
export function AlContactCard({
  name,
  subtitle,
  verified = false,
  verifiedLabel = 'Verified',
  avatar,
  verifiedIcon,
  className,
}: AlContactCardProps) {
  return (
    <div className={cn('al-contact-card', className)}>
      {avatar}
      <div className="al-contact-card__meta">
        <p className="al-contact-card__name">{name}</p>
        <p className="al-contact-card__subtitle">{subtitle}</p>
      </div>
      {verified ? (
        <div className="al-contact-card__verified">
          {verifiedIcon}
          <span className="al-contact-card__verified-label">{verifiedLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
