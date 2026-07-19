'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SavedAddress } from '../../../../../shared/services/checkout-api';
import styles from './index.module.css';

interface AddressCardProps {
  address: SavedAddress;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AddressCard({ address, selected, onSelect, onEdit, onDelete }: AddressCardProps) {
  const { name, label, isDefault, line1, line2, city, state, pincode, phone } = address;

  const streetLine = line2 ? `${line1}, ${line2}` : line1;
  const cityLine = `${city}, ${state} ${pincode}`;
  const phoneLine = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  return (
    <div
      className={cn(styles.card, selected && styles.selected)}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span className={cn(styles.radio, selected && styles.radioOn)} aria-hidden>
        {selected ? <Check className={styles.radioCheck} /> : null}
      </span>

      <div className={styles.content}>
        <div className={styles.row1}>
          <div className={styles.nameG}>
            <span className={styles.name}>{name}</span>
            {label ? <span className={styles.label}>{label}</span> : null}
            {isDefault ? <span className={styles.default}>· Default</span> : null}
          </div>
          <div className={styles.acts}>
            <button
              type="button"
              className={styles.act}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={styles.act}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </button>
          </div>
        </div>

        <span className={styles.line}>{streetLine}</span>
        <span className={styles.line}>{cityLine}</span>
        <span className={styles.phone}>{phoneLine}</span>
      </div>
    </div>
  );
}
