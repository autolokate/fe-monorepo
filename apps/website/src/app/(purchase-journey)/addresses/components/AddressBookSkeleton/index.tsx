import { SkeletonBar } from '../../../shared/components/Skeleton';
import styles from './index.module.css';

/** Loading placeholder for the address list — a couple of card-shaped blocks. */
export function AddressBookSkeleton() {
  return (
    <div className={styles.list}>
      {[0, 1].map((row) => (
        <div key={row} className={styles.card}>
          <SkeletonBar w={20} h={20} radius={10} />
          <div className={styles.body}>
            <div className={styles.rowBetween}>
              <SkeletonBar w={160} h={18} />
              <SkeletonBar w={90} h={14} />
            </div>
            <SkeletonBar w={240} h={15} />
            <SkeletonBar w={200} h={15} />
            <SkeletonBar w={130} h={15} />
          </div>
        </div>
      ))}
      <SkeletonBar h={52} radius={18} />
    </div>
  );
}
