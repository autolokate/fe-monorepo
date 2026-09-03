import { HERO_STATS } from '../HeroBanner/constants';
import styles from './index.module.css';

export function NetworkStrip() {
  return (
    <section className={styles.section} aria-label="Network highlights">
      <div className={styles.inner}>
        <ul className={styles.stats}>
          {HERO_STATS.map((stat) => (
            <li key={stat.label} className={styles.stat}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
