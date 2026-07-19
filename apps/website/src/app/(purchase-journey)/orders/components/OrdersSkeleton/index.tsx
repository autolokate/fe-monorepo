import { SkeletonBar } from '../../../shared/components/Skeleton';
import styles from './index.module.css';

/** Loading placeholder for the orders list — a few card-shaped shimmer blocks. */
export function OrdersSkeleton() {
  return (
    <div className={styles.list}>
      {[0, 1, 2].map((row) => (
        <div key={row} className={styles.card}>
          <SkeletonBar w={44} h={44} radius={22} />
          <div className={styles.body}>
            <div className={styles.rowBetween}>
              <SkeletonBar w={140} h={16} />
              <SkeletonBar w={72} h={16} />
            </div>
            <SkeletonBar w={180} h={17} />
            <div className={styles.rowBetween}>
              <SkeletonBar w={150} h={13} />
              <SkeletonBar w={110} h={13} />
            </div>
            <div className={styles.actions}>
              <SkeletonBar w={120} h={14} />
              <SkeletonBar w={130} h={40} radius={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
