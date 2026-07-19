import { cn } from '@/lib/utils';
import styles from './index.module.css';

interface SkeletonBarProps {
  /** Width in px or any CSS length. Defaults to 100%. */
  w?: number | string;
  /** Height in px. */
  h: number;
  /** Corner radius in px. Defaults to 6. */
  radius?: number;
  className?: string;
}

/** A single shimmering placeholder block. Shared across journey loading states. */
export function SkeletonBar({ w, h, radius = 6, className }: SkeletonBarProps) {
  return (
    <span
      className={cn(styles.bar, className)}
      style={{ width: w ?? '100%', height: h, borderRadius: radius }}
    />
  );
}
