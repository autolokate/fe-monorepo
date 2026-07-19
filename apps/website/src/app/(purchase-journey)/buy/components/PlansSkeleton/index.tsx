import { SkeletonBar as Bar } from '../../../shared/components/Skeleton';
import styles from './index.module.css';

function CardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.headRow}>
          <Bar w={44} h={44} radius={12} />
          <div className={styles.nameCol}>
            <Bar w={90} h={16} />
            <Bar w={120} h={12} />
          </div>
        </div>
        <Bar w={120} h={34} radius={8} />
        <Bar w={150} h={12} />
        <div className={styles.featureCol}>
          <Bar w={280} h={12} />
          <Bar w={270} h={12} />
          <Bar w={260} h={12} />
          <Bar w={250} h={12} />
        </div>
      </div>
      <Bar h={56} radius={14} />
    </div>
  );
}

/** Loading state for the plans page (Figma "P1 · Choose protection · Loading"). */
export function PlansSkeleton() {
  return (
    <>
      <div className={styles.cards}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className={styles.trust}>
        <Bar w={340} h={18} radius={6} />
        <Bar w={220} h={14} radius={6} />
      </div>
    </>
  );
}
