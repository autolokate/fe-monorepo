import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './footer.module.css';

interface FooterStoreBadgeProps {
  href: string;
  topLabel: string;
  bottomLabel: string;
  icon: ReactNode;
  className?: string;
}

export function FooterStoreBadge({
  href,
  topLabel,
  bottomLabel,
  icon,
  className,
}: FooterStoreBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${topLabel} ${bottomLabel}`}
      className={cn(styles.storeBadge, className)}
    >
      <span className={styles.storeIcon}>{icon}</span>
      <span className={styles.storeLabel}>
        <span className={styles.storeTop}>{topLabel}</span>
        <span className={styles.storeBottom}>{bottomLabel}</span>
      </span>
    </a>
  );
}
