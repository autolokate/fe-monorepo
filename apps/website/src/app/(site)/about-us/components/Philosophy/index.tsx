import { Shield, QrCode, PhoneOff, Car } from 'lucide-react';
import { BELIEF_TILES, PHILOSOPHY_COPY } from './constants';
import type { BeliefId } from './types';
import styles from './index.module.css';

const ICONS: Record<BeliefId, typeof Shield> = {
  automatic: Shield,
  backup: QrCode,
  privacy: PhoneOff,
  record: Car,
};

export function Philosophy() {
  const { eyebrow, headline, headlineAccent, subheading } = PHILOSOPHY_COPY;

  return (
    <section aria-labelledby="beliefs-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="beliefs-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <ol className={styles.beliefs}>
          {BELIEF_TILES.map((tile, index) => {
            const Icon = ICONS[tile.id];
            return (
              <li key={tile.id} className={styles.belief}>
                <div className={styles.beliefTop}>
                  <span className={styles.beliefIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon className={styles.icon} strokeWidth={1.75} />
                  </span>
                </div>
                <h3 className={styles.beliefTitle}>{tile.title}</h3>
                <p className={styles.beliefBody}>{tile.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
