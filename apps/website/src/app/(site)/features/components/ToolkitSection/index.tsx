import { ICON_COLOR, TOOLKIT_COPY, TOOLKIT_ROWS } from './constants';
import type { ToolkitTile } from './types';
import styles from './index.module.css';

const ICON_FALLBACK = '#0a0a0c';

const ROW_CLASS = {
  wide: styles.rowWide,
  three: styles.rowThree,
  two: styles.rowTwo,
} as const;

function Tile({ tile }: { tile: ToolkitTile }) {
  const { Icon } = tile;

  return (
    <article className={`${styles.tile} ${tile.width === 'wide' ? styles.tileWide : ''}`}>
      <div className={styles.head}>
        <div className={styles.headRow}>
          <span
            className={styles.headIcon}
            style={{ color: ICON_COLOR.get(Icon) ?? ICON_FALLBACK }}
            aria-hidden="true"
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </span>
          <h3 className={styles.tileTitle}>{tile.title}</h3>
        </div>
        <p className={styles.tileSubtitle}>{tile.subtitle}</p>
      </div>

      <ul
        className={`${styles.capabilities} ${
          tile.capabilityColumns === 2 ? styles.capabilitiesTwoCol : ''
        }`}
      >
        {tile.capabilities.map((capability) => {
          const { Icon: CapIcon } = capability;
          return (
            <li key={capability.id} className={styles.capability}>
              <span
                className={styles.capIcon}
                style={{ color: ICON_COLOR.get(CapIcon) ?? ICON_FALLBACK }}
                aria-hidden="true"
              >
                <CapIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <p className={styles.capText}>
                <span className={styles.capLabel}>{capability.label}</span>
                <span className={styles.capDetail}> · {capability.detail}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export function ToolkitSection() {
  const { eyebrow, headlineAccent, headline, subheading } = TOOLKIT_COPY;

  return (
    <section aria-labelledby="toolkit-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="toolkit-heading" className={styles.headline}>
            <span className={styles.headlineAccent}>{headlineAccent}</span>
            {headline}
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <div className={styles.bento}>
          {TOOLKIT_ROWS.map((row) => (
            <div key={row.id} className={`${styles.row} ${ROW_CLASS[row.layout]}`}>
              {row.tiles.map((tile) => (
                <Tile key={tile.id} tile={tile} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
