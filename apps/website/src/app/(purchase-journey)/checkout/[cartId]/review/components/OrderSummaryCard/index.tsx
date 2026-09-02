import { cn } from '@/lib/utils';
import { formatRupees } from '../../../../../shared/plans';
import type { Cart } from '../../../../../shared/services/checkout-api';
import styles from './index.module.css';

interface OrderSummaryCardProps {
  cart: Cart;
  planName: string;
  planSubtitle: string;
  riderCount: number;
  /** Promo code echoed by the backend, shown on the discount line. */
  appliedCode: string;
}

interface LineProps {
  name: string;
  sub: string;
  amount: string;
  accent?: boolean;
}

function Line({ name, sub, amount, accent }: LineProps) {
  return (
    <div className={styles.line}>
      <div className={styles.lineLeft}>
        <span className={styles.lineName}>{name}</span>
        <span className={styles.lineSub}>{sub}</span>
      </div>
      <span className={cn(styles.amount, accent && styles.amountAccent)}>{amount}</span>
    </div>
  );
}

/** The priced order breakdown (Figma "WebOrderSummary"). All money is in paise. */
export function OrderSummaryCard({
  cart,
  planName,
  planSubtitle,
  riderCount,
  appliedCode,
}: OrderSummaryCardProps) {
  const hasRiders = riderCount > 0 && cart.riderCoverPaise > 0;
  const hasDiscount = cart.discountPaise > 0;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Order summary</h2>

      <Line name={planName} sub={planSubtitle} amount={formatRupees(cart.planPricePaise)} />

      {hasRiders ? (
        <Line
          name={`${String(riderCount)} rider${riderCount > 1 ? 's' : ''}`}
          sub="₹1L accident cover"
          amount={`+${formatRupees(cart.riderCoverPaise)}`}
        />
      ) : null}

      {hasDiscount ? (
        <Line
          name="Discount"
          sub={appliedCode ? `${appliedCode} · first year` : 'Promo applied'}
          amount={`−${formatRupees(cart.discountPaise)}`}
          accent
        />
      ) : null}

      <div className={styles.notes}>
        <span className={styles.note}>Smart QR kit ships free</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.total}>
        <div className={styles.totalLeft}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalSub}>Billed today · renews yearly</span>
        </div>
        <span className={styles.totalAmount}>{formatRupees(cart.totalPaise)}</span>
      </div>
    </div>
  );
}
