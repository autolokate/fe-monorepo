'use client';

import { useEffect } from 'react';
import type { SavedAddress } from '@/services/purchase';
import styles from './index.module.css';

interface DeleteAddressDialogProps {
  address: SavedAddress;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAddressDialog({
  address,
  deleting,
  onCancel,
  onConfirm,
}: DeleteAddressDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onCancel, deleting]);

  const summary = [
    [address.line1, address.line2].filter(Boolean).join(', '),
    `${address.city} ${address.pincode}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-address-title"
      >
        <h2 id="delete-address-title" className={styles.title}>
          Delete this address?
        </h2>
        <p className={styles.summary}>{summary}</p>

        <div className={styles.btns}>
          <button type="button" className={styles.cancel} onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className={styles.delete} onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
