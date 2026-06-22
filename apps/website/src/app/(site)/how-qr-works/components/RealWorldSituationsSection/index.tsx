import { REAL_WORLD_COPY, REAL_WORLD_SITUATIONS } from "./constants";
import { SituationCard } from "./SituationCard";
import styles from "./index.module.css";

export function RealWorldSituationsSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="shop-real-world-heading"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.badge}>{REAL_WORLD_COPY.eyebrow}</span>
          <h2 id="shop-real-world-heading" className={styles.headline}>
            {REAL_WORLD_COPY.headline}
          </h2>
        </header>

        <div className={styles.grid}>
          {REAL_WORLD_SITUATIONS.map((situation) => (
            <SituationCard key={situation.id} situation={situation} />
          ))}
        </div>
      </div>
    </section>
  );
}
