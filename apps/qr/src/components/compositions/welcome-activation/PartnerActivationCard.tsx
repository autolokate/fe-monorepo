import { AlIcon } from '@autolokate/icons';

import './partner-activation-card.css';

export type PartnerActivationCardProps = {
  initials: string;
  name: string;
  subtitle: string;
};

export function PartnerActivationCard({ initials, name, subtitle }: PartnerActivationCardProps) {
  return (
    <article className="ob-partner-card">
      <span className="ob-partner-card__avatar" aria-hidden>
        {initials}
      </span>
      <div className="ob-partner-card__content">
        <div className="ob-partner-card__title-row">
          <span className="ob-partner-card__name">{name}</span>
          <AlIcon name="circle-check" size={18} className="ob-partner-card__verified" aria-hidden />
        </div>
        <span className="ob-partner-card__subtitle">{subtitle}</span>
      </div>
    </article>
  );
}
