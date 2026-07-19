import { SkeletonBar } from '../../../../../shared/components/Skeleton';
import styles from './index.module.css';

/** Loading state for the address step (Figma "P4 · Address · Loading"). */
export function AddressSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        <SkeletonBar h={104} radius={16} />
        <SkeletonBar h={104} radius={16} />
      </div>
      <div className={styles.cta}>
        <SkeletonBar h={56} radius={14} />
      </div>
    </div>
  );
}
