import { Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRupees } from '../../../../shared/plans';
import type { PlanRiderOption } from '../../../../shared/services/plans-api';
import styles from './index.module.css';

interface RiderOptionProps {
  option: PlanRiderOption;
  selected: boolean;
  onToggle: () => void;
}

/** A single "add N rider(s)" choice (Figma "rider-option"). Toggles selection. */
export function RiderOption({ option, selected, onToggle }: RiderOptionProps) {
  const { riderCount, pricePaise, originalPricePaise } = option;
  const savePaise = Math.max(0, originalPricePaise - pricePaise);
  const label = `${String(riderCount)} rider${riderCount > 1 ? 's' : ''}`;

  return (
    <button
      type="button"
      className={cn(styles.option, selected && styles.selected)}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <span className={cn(styles.radio, selected && styles.radioOn)}>
        {selected ? <Check className={styles.radioCheck} aria-hidden /> : null}
      </span>

      <span className={styles.mid}>
        <span className={styles.titleRow}>
          <User className={styles.relationIcon} aria-hidden />
          <span className={styles.title}>{label}</span>
        </span>
        <span className={styles.sub}>Same ₹1L cover</span>
      </span>

      <span className={styles.right}>
        <span className={styles.addPrice}>+{formatRupees(pricePaise)}</span>
        <span className={styles.saveRow}>
          {savePaise > 0 ? (
            <>
              <s className={styles.wasPrice}>{formatRupees(originalPricePaise)}</s>
              <span className={styles.save}>Save {formatRupees(savePaise)}</span>
            </>
          ) : null}
        </span>
      </span>
    </button>
  );
}
