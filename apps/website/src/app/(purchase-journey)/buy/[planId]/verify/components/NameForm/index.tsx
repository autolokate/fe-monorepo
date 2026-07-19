'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './index.module.css';

interface NameFormProps {
  name: string;
  onNameChange: (value: string) => void;
  error: string | null;
  saving: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

/** Phase C of verify: capture the buyer's name, saved to their profile. */
export function NameForm({
  name,
  onNameChange,
  error,
  saving,
  canSubmit,
  onSubmit,
}: NameFormProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className={styles.inner}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="journey-name">
            Full name
          </label>
          <div className={cn(styles.field, error && styles.fieldError)}>
            <input
              id="journey-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              placeholder="e.g. Aarav Shah"
              value={name}
              onChange={(e) => {
                onNameChange(e.target.value);
              }}
              // eslint-disable-next-line jsx-a11y/no-autofocus -- natural focus for a single-field step
              autoFocus
            />
          </div>
          <p className={cn(styles.helper, error && styles.helperError)}>
            {error ?? 'This is who the order and delivery will be under'}
          </p>
        </div>
      </div>

      <button type="submit" className={styles.cta} disabled={!canSubmit}>
        {saving ? 'Saving…' : 'Continue'}
        {!saving ? <ArrowRight className={styles.ctaIcon} aria-hidden /> : null}
      </button>
    </form>
  );
}
