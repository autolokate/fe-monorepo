import { SkeletonBar } from '../../../../../shared/components/Skeleton';
import styles from './index.module.css';

/** Loading state (Figma "P5 · Summary · Loading"): promo bar, summary card, CTA. */
export function ReviewSkeleton() {
  return (
    <div className={styles.wrap}>
      <SkeletonBar h={52} radius={14} />

      <div className={styles.card}>
        <SkeletonBar w={150} h={22} />
        {[0, 1, 2].map((row) => (
          <div key={row} className={styles.row}>
            <SkeletonBar w={180} h={16} />
            <SkeletonBar w={70} h={16} />
          </div>
        ))}
        <div className={styles.row}>
          <SkeletonBar w={80} h={26} />
          <SkeletonBar w={120} h={30} />
        </div>
      </div>

      <SkeletonBar h={56} radius={14} />
    </div>
  );
}
