import { TEAM_HERO } from '../constants';
import styles from './index.module.css';

export function TeamHero() {
  return (
    <section className={styles.hero} aria-labelledby="team-hero-heading">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash} aria-hidden="true" />
          {TEAM_HERO.eyebrow}
        </p>
        <h1 id="team-hero-heading" className={styles.headline}>
          {TEAM_HERO.headline}
          <br />
          <span className={styles.headlineAccent}>{TEAM_HERO.headlineAccent}</span>
        </h1>
        <p className={styles.description}>{TEAM_HERO.description}</p>
      </div>
    </section>
  );
}
