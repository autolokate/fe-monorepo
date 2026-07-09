import { cn } from '../../../utils/cn';

import type { AlPlanCardProps } from './PlanCard.types';
import './PlanCard.css';

export function AlPlanCard({
  name,
  price,
  features,
  badge,
  includesLabel,
  addon,
  selected = false,
  featureIcon,
  selectedIcon,
  onSelect,
  className,
  ...props
}: AlPlanCardProps) {
  const isInteractive = typeof onSelect === 'function';
  const cardClassName = cn(
    'al-plan-card',
    isInteractive && 'al-plan-card--interactive',
    selected && 'al-plan-card--selected',
    className,
  );

  const content = (
    <>
      {badge ? <span className="al-plan-card__badge">{badge}</span> : null}
      <h3 className="al-plan-card__name">{name}</h3>
      <p className="al-plan-card__price">{price}</p>
      {includesLabel ? <span className="al-plan-card__includes">{includesLabel}</span> : null}
      <ul className="al-plan-card__features">
        {features.map((feature) => (
          <li key={feature} className="al-plan-card__feature">
            {featureIcon ? (
              <span className="al-plan-card__feature-icon" aria-hidden>
                {featureIcon}
              </span>
            ) : null}
            <span className="al-plan-card__feature-label">{feature}</span>
          </li>
        ))}
      </ul>
      {addon ? (
        <div className="al-plan-card__addon">
          <hr className="al-plan-card__addon-separator" />
          <div className="al-plan-card__addon-row">
            <span className="al-plan-card__addon-mark" aria-hidden>
              +
            </span>
            <span className="al-plan-card__addon-label">{addon.label}</span>
          </div>
        </div>
      ) : null}
      {selected && selectedIcon ? (
        <span className="al-plan-card__selected-mark" aria-hidden>
          {selectedIcon}
        </span>
      ) : null}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className={cardClassName}
        aria-pressed={selected}
        onClick={onSelect}
        {...props}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={cardClassName} {...props}>
      {content}
    </article>
  );
}
