'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import styles from './index.module.css';

interface OtpInputProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
  /** Fired when all boxes are filled (e.g. to auto-submit). */
  onComplete?: (code: string) => void;
}

/** Segmented one-time-code input (Figma "otp-row"). Fully controlled. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  autoFocus,
  onComplete,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusBox = (index: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, index))];
    el?.focus();
    el?.select();
  };

  const commit = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    return digits;
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;
    const next = commit(value.slice(0, index) + digits);
    focusBox(next.length);
    if (next.length === length) onComplete?.(next);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        commit(value.slice(0, index));
      } else if (index > 0) {
        commit(value.slice(0, index - 1));
        focusBox(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const next = commit(e.clipboardData.getData('text'));
    focusBox(next.length);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <div className={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={cn(styles.box, error && styles.error)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => {
            handleChange(i, e.target.value);
          }}
          onKeyDown={(e) => {
            handleKeyDown(i, e);
          }}
          onPaste={handlePaste}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- expected UX for an OTP field
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${String(i + 1)}`}
        />
      ))}
    </div>
  );
}
