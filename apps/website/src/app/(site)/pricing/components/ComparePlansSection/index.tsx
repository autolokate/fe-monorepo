import { CompareTable } from "./CompareTable";
import styles from "./index.module.css";

export function ComparePlansSection() {
  return (
    <section className={styles.section} aria-labelledby="compare-plans-heading">
      <div className={styles.container}>
        <CompareTable />
      </div>
    </section>
  );
}
