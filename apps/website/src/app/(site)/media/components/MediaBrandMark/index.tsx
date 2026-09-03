/* eslint-disable @next/next/no-img-element -- brand SVG mark */
import styles from './index.module.css';

interface MediaBrandMarkProps {
  /** Visual size for cards vs featured/hero */
  size?: 'sm' | 'md' | 'lg';
  /** Corner placement — avoid Featured/Popular badges at top-left */
  corner?: 'top-left' | 'bottom-left' | 'bottom-right';
  className?: string;
}

const CORNER_CLASS = {
  'top-left': styles.topleft,
  'bottom-left': styles.bottomleft,
  'bottom-right': styles.bottomright,
} as const;

/**
 * Autolokate mark overlaid on article/video media so every visual
 * carries brand presence (YouTube thumbs cannot be permanently edited).
 */
export function MediaBrandMark({
  size = 'md',
  corner = 'bottom-left',
  className,
}: MediaBrandMarkProps) {
  return (
    <span
      className={[styles.mark, styles[size], CORNER_CLASS[corner], className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <img src="/brand/al-logo-dark.svg" alt="" className={styles.logo} draggable={false} />
    </span>
  );
}
