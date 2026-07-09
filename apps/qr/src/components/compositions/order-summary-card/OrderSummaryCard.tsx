import { AlText } from '@autolokate/ui';

import type { OrderSummaryTotals } from '@/features/qr-purchase/types-checkout.js';

import './order-summary-card.css';

export type OrderSummaryCardProps = {
  summary: OrderSummaryTotals;
};

/** Figma R08 layout_AQ2T2I / R08b layout_IUCYD0 */
export function OrderSummaryCard({ summary }: OrderSummaryCardProps) {
  return (
    <section className="ob-order-summary-card" aria-label="Order summary">
      <div className="ob-order-summary-card__row">
        <AlText tone="muted" className="ob-order-summary-card__label">
          {summary.planLine.label}
        </AlText>
        <AlText className="ob-order-summary-card__value">{summary.planLine.value}</AlText>
      </div>
      {summary.riderLine ? (
        <div className="ob-order-summary-card__row">
          <AlText tone="muted" className="ob-order-summary-card__label">
            {summary.riderLine.label}
          </AlText>
          <AlText className="ob-order-summary-card__value">{summary.riderLine.value}</AlText>
        </div>
      ) : null}
      {summary.promoLine ? (
        <div className="ob-order-summary-card__row">
          <AlText tone="muted" className="ob-order-summary-card__label">
            {summary.promoLine.label}
          </AlText>
          <AlText className="ob-order-summary-card__value ob-order-summary-card__value--promo">
            {summary.promoLine.value}
          </AlText>
        </div>
      ) : null}
      <hr className="ob-order-summary-card__divider" />
      <div className="ob-order-summary-card__row ob-order-summary-card__row--total">
        <span className="ob-order-summary-card__total-label">Total</span>
        <span className="ob-order-summary-card__total-value">{summary.totalLabel}</span>
      </div>
      <AlText tone="muted" className="ob-order-summary-card__gst">
        {summary.gstNote}
      </AlText>
    </section>
  );
}
