'use client';

import { useState } from 'react';
import { Check, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromoState } from '../../hooks/useReviewCart';
import styles from './index.module.css';

interface PromoFieldProps {
  state: PromoState;
  /** Code echoed by the backend, shown in the "applied" pill. */
  appliedCode: string;
  /** An apply/remove request is in flight. */
  applying: boolean;
  onApply: (code: string) => void;
  onRemove: () => void;
}

/**
 * Promo entry (Figma "promo"): a rounded field with three looks — idle (enter a
 * code + Apply), applied (green pill + Remove), and invalid (amber border + a
 * helper line). The typed code is kept locally; validity is decided upstream.
 */
export function PromoField({ state, appliedCode, applying, onApply, onRemove }: PromoFieldProps) {
  const [value, setValue] = useState('');

  if (state === 'applied') {
    return (
      <div className={styles.promo}>
        <div className={cn(styles.box, styles.boxApplied)}>
          <Check className={styles.iconApplied} aria-hidden />
          <span className={styles.appliedText}>{appliedCode} applied</span>
          <button
            type="button"
            className={styles.remove}
            onClick={() => {
              setValue('');
              onRemove();
            }}
            disabled={applying}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  const invalid = state === 'invalid';
  const submit = () => {
    const code = value.trim();
    if (code) onApply(code);
  };

  return (
    <div className={styles.promo}>
      <div className={cn(styles.box, invalid && styles.boxInvalid)}>
        <Tag className={styles.icon} aria-hidden />
        <input
          className={styles.input}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Have a promo code?"
          aria-label="Promo code"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.apply}
          onClick={submit}
          disabled={applying || value.trim().length === 0}
        >
          {applying ? 'Applying…' : 'Apply'}
        </button>
      </div>
      {invalid ? (
        <p className={styles.invalidText}>That code isn’t valid. Check and try again.</p>
      ) : null}
    </div>
  );
}
