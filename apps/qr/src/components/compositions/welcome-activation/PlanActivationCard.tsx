import { AlIcon } from '@autolokate/icons';

import './plan-activation-card.css';

export type PlanActivationCardProps = {
  planName: string;
  priceDisplay?: string;
  statusLabel: 'Paid';
  includesLabel?: string;
  features: readonly string[];
  riderRowLabel?: string;
  vehiclePlate?: string;
};

export function PlanActivationCard({
  planName,
  priceDisplay,
  statusLabel,
  includesLabel,
  features,
  riderRowLabel,
  vehiclePlate,
}: PlanActivationCardProps) {
  return (
    <section className="ob-plan-activation">
      <div className="ob-plan-activation__label-row">
        <span className="ob-plan-activation__section-label">YOUR PLAN</span>
        {vehiclePlate ? (
          <span className="ob-plan-activation__vehicle">For {vehiclePlate}</span>
        ) : null}
      </div>
      <article className="ob-plan-activation__card">
        <div className="ob-plan-activation__header">
          <h3 className="ob-plan-activation__name">{planName}</h3>
          <span className="ob-plan-activation__status">
            <AlIcon name="check" size={10} className="ob-plan-activation__status-icon" aria-hidden />
            {statusLabel}
          </span>
        </div>
        {priceDisplay ? <p className="ob-plan-activation__price">{priceDisplay}</p> : null}
        {includesLabel ? (
          <span className="ob-plan-activation__includes">{includesLabel}</span>
        ) : null}
        <ul className="ob-plan-activation__features">
          {features.map((feature) => (
            <li key={feature} className="ob-plan-activation__feature">
              <AlIcon name="circle-check" size={15} className="ob-plan-activation__feature-icon" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {riderRowLabel ? (
          <div className="ob-plan-activation__addon">
            <hr className="ob-plan-activation__addon-separator" />
            <div className="ob-plan-activation__addon-row">
              <AlIcon name="user" size={15} className="ob-plan-activation__addon-icon" aria-hidden />
              <span className="ob-plan-activation__addon-label">{riderRowLabel}</span>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}

export function PlanActivationCardSkeleton({ showVehicle = false }: { showVehicle?: boolean }) {
  return (
    <section className="ob-plan-activation ob-plan-activation--skeleton" aria-busy="true">
      <div className="ob-plan-activation__label-row">
        <span className="ob-plan-activation__section-label">YOUR PLAN</span>
        {showVehicle ? (
          <span className="ob-plan-activation__vehicle">For MH12 AB 1234</span>
        ) : null}
      </div>
      <article className="ob-plan-activation__card">
        <div className="ob-plan-activation__skeleton ob-plan-activation__skeleton--title" />
        <div className="ob-plan-activation__skeleton ob-plan-activation__skeleton--price" />
        <div className="ob-plan-activation__skeleton ob-plan-activation__skeleton--line" />
        <div className="ob-plan-activation__skeleton ob-plan-activation__skeleton--line" />
        <div className="ob-plan-activation__skeleton ob-plan-activation__skeleton--line" />
        <div className="ob-plan-activation__skeleton ob-plan-activation__skeleton--line-short" />
      </article>
    </section>
  );
}
