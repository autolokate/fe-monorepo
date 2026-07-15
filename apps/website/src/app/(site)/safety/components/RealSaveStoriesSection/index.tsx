import { SAVE_STATS, STORIES_COPY } from './constants';
import { StoriesCarousel } from './StoriesCarousel';
import styles from './index.module.css';

export function RealSaveStoriesSection() {
  return (
    <section className={styles.section} aria-labelledby="stories-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{STORIES_COPY.eyebrow}</span>
          <h2 id="stories-heading" className={styles.title}>
            {STORIES_COPY.title}
          </h2>
        </header>

        <div className={styles.body}>
          <dl className={styles.stats}>
            {SAVE_STATS.map(({ id, value, label, Icon }) => (
              <div key={id} className={styles.stat}>
                <span className={styles.statIcon} aria-hidden>
                  <Icon className="h-5 w-5 stroke-[1.8]" />
                </span>
                <div className={styles.statText}>
                  <dt className={styles.statValue}>{value}</dt>
                  <dd className={styles.statLabel}>{label}</dd>
                </div>
              </div>
            ))}
          </dl>

          <StoriesCarousel />
        </div>
      </div>
    </section>
  );
}
