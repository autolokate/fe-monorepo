import { TOOLKIT_COPY, TOOLKIT_ROWS } from './constants';
import type { ToolkitTile } from './types';
import styles from './index.module.css';

function StoryBlock({ tile, index }: { tile: ToolkitTile; index: number }) {
  return (
    <article className={styles.story}>
      <div className={styles.storyLead}>
        <span className={styles.storyIndex}>{String(index).padStart(2, '0')}</span>
        <div className={styles.storyHead}>
          <h3 className={styles.storyTitle}>{tile.title}</h3>
          <p className={styles.storySubtitle}>{tile.subtitle}</p>
        </div>
      </div>

      <ul
        className={`${styles.capabilities} ${
          tile.capabilityColumns === 2 ? styles.capabilitiesTwoCol : ''
        }`}
      >
        {tile.capabilities.map((capability) => (
          <li key={capability.id} className={styles.capability}>
            <span className={styles.capLabel}>{capability.label}</span>
            <span className={styles.capDetail}>{capability.detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ToolkitSection() {
  const { eyebrow, headlineAccent, headline, subheading } = TOOLKIT_COPY;
  let storyIndex = 0;

  return (
    <section
      aria-labelledby="toolkit-heading"
      className={`mkt-section mkt-mutedBg ${styles.section}`}
    >
      <div className={`mkt-container ${styles.inner}`}>
        <header className={styles.header}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="toolkit-heading" className={`mkt-headline ${styles.headline}`}>
            <span className={styles.headlineAccent}>{headlineAccent}</span>
            {headline}
          </h2>

          <p className={`mkt-body ${styles.subheading}`}>{subheading}</p>
        </header>

        <div className={styles.stories}>
          {TOOLKIT_ROWS.map((row) =>
            row.tiles.map((tile) => {
              storyIndex += 1;
              return <StoryBlock key={tile.id} tile={tile} index={storyIndex} />;
            }),
          )}
        </div>
      </div>
    </section>
  );
}
