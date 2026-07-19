import { SkeletonBar as Bar } from '../../../../shared/components/Skeleton';
import styles from './index.module.css';

/** Loading state for the configure step (Figma "P2 · Configure · Loading"). */
export function ConfigureSkeleton() {
  return (
    <>
      <div className={styles.order}>
        <span className={styles.eyebrow}>YOUR ORDER</span>
        <Bar h={72} radius={16} />
        <Bar h={72} radius={16} />
        <Bar h={72} radius={16} />
        <Bar w={160} h={22} radius={6} />
      </div>
      <p className={styles.note}>You’ll add their name and details after payment</p>
      <Bar w={320} h={56} radius={14} className={styles.ctaBar} />
    </>
  );
}
