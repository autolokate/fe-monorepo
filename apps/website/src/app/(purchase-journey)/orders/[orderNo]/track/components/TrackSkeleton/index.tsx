import { SkeletonBar } from '../../../../../shared/components/Skeleton';
import styles from './index.module.css';

/** Loading placeholder for the tracking page: head, status banner, timeline card. */
export function TrackSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <SkeletonBar w={220} h={30} radius={8} />
        <SkeletonBar w={260} h={16} />
      </div>

      <SkeletonBar h={68} radius={18} />

      <div className={styles.card}>
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className={styles.row}>
            <SkeletonBar w={20} h={20} radius={10} />
            <div className={styles.rowText}>
              <SkeletonBar w={160} h={15} />
              <SkeletonBar w={110} h={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
