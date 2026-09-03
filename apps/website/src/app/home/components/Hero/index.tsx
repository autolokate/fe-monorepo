'use client';

import { CinematicScene } from './CinematicScene';
import { HeroCopyBlock } from './HeroNav';
import { HeroParallax } from './HeroParallax';
import { HeroStatsBar } from './HeroStatsBar';
import styles from './HomeHero.module.css';

/** Full-viewport cinematic homepage hero — video background, minimal copy. */
export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <CinematicScene className={styles.scene} />
      <div className={styles.gradient} aria-hidden="true" />
      <HeroParallax>
        <div className={styles.content}>
          <HeroCopyBlock />
        </div>
      </HeroParallax>
      <HeroStatsBar />
    </section>
  );
}
