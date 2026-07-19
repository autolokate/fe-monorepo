'use client';

import { cn } from '@/lib/utils';
import type { SavedAddress } from '@/services/purchase';
import styles from './index.module.css';

interface AddressRowProps {
  address: SavedAddress;
  onSetDefault: (address: SavedAddress) => void;
  onEdit: (address: SavedAddress) => void;
  onDelete: (address: SavedAddress) => void;
}

export function AddressRow({ address, onSetDefault, onEdit, onDelete }: AddressRowProps) {
  const lineA = [address.line1, address.line2].filter(Boolean).join(', ');
  const lineB = [`${address.city}, ${address.state}`, address.pincode].filter(Boolean).join(' ');
  const phoneLine = `+91 ${address.phone.slice(0, 5)} ${address.phone.slice(5)}`;

  return (
    <div className={cn(styles.card, address.isDefault && styles.cardDefault)}>
      <button
        type="button"
        className={cn(styles.radio, address.isDefault && styles.radioOn)}
        onClick={() => {
          onSetDefault(address);
        }}
        aria-label={address.isDefault ? 'Default address' : 'Set as default'}
        aria-pressed={address.isDefault}
      />

      <div className={styles.content}>
        <div className={styles.row1}>
          <div className={styles.nameGroup}>
            <span className={styles.name}>{address.name || 'Saved address'}</span>
            {address.label ? <span className={styles.label}>{address.label}</span> : null}
            {address.isDefault ? <span className={styles.default}>· Default</span> : null}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                onEdit(address);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                onDelete(address);
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {lineA ? <span className={styles.line}>{lineA}</span> : null}
        {lineB ? <span className={styles.line}>{lineB}</span> : null}
        <span className={styles.line}>{phoneLine}</span>
      </div>
    </div>
  );
}
