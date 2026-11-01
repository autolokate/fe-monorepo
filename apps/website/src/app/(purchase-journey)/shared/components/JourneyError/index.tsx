import Link from 'next/link';
import { AlertTriangle, ArrowRight, LogIn, RotateCw } from 'lucide-react';
import { WHATSAPP_URL } from '@/layouts/Footer/constants';
import styles from './index.module.css';

interface JourneyErrorProps {
  /** Headline, e.g. "Couldn't load the plans". */
  title: string;
  /** Optional sub-message. Defaults to the standard "on our end" line. */
  message?: string;
  onRetry: () => void;
  /** Replace "Try again" with a link (e.g. to sign in) when retrying cannot help. */
  action?: { label: string; href: string };
}

/**
 * Shared error state for journey pages (Figma "…· Error"). Amber alert tile,
 * a headline + reassurance line, a "Try again" action, and a WhatsApp fallback.
 */
export function JourneyError({
  title,
  message = 'This is on our end, not your connection',
  onRetry,
  action,
}: JourneyErrorProps) {
  return (
    <div className={styles.wrap}>
      <span className={styles.tile}>
        <AlertTriangle className={styles.icon} aria-hidden />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{message}</p>

      {action ? (
        <Link className={styles.retry} href={action.href}>
          {action.label}
          <LogIn className={styles.retryIcon} aria-hidden />
        </Link>
      ) : (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
          <RotateCw className={styles.retryIcon} aria-hidden />
        </button>
      )}

      <a className={styles.help} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
        Still stuck? Message us on WhatsApp
        <ArrowRight className={styles.helpArrow} aria-hidden />
      </a>
    </div>
  );
}
