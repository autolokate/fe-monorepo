import { ICON_COLOR, TOOLKIT_COPY, TOOLKIT_ROWS } from './constants';
import type { ToolkitTile } from './types';
import styles from './index.module.css';

function CapabilityItem({
  label,
  detail,
  Icon,
}: {
  label: string;
  detail: string;
  Icon: ToolkitTile['capabilities'][number]['Icon'];
}) {
  const iconColor = ICON_COLOR.get(Icon) ?? 'var(--mkt-ink-primary)';

  return (
    <li className={styles.capability}>
      <span className={styles.capIcon} style={{ color: iconColor }} aria-hidden="true">
        <Icon className={styles.capIconSvg} strokeWidth={1.75} />
      </span>
      <div className={styles.capCopy}>
        <span className={styles.capLabel}>{label}</span>
        <span className={styles.capDetail}>{detail}</span>
      </div>
    </li>
  );
}

function StoryBlock({ tile, index }: { tile: ToolkitTile; index: number }) {
  const TileIcon = tile.Icon;
  const iconColor = ICON_COLOR.get(TileIcon) ?? 'var(--mkt-ink-primary)';

  return (
    <article id={tile.id} className={styles.story}>
      <div className={styles.storyLead}>
        <span className={styles.storyIndex}>{String(index).padStart(2, '0')}</span>
        <div className={styles.storyHead}>
          <div className={styles.storyTitleRow}>
            <span className={styles.tileIcon} style={{ color: iconColor }} aria-hidden="true">
              <TileIcon className={styles.tileIconSvg} strokeWidth={1.75} />
            </span>
            <h3 className={styles.storyTitle}>{tile.title}</h3>
          </div>
          <p className={styles.storySubtitle}>{tile.subtitle}</p>
        </div>
      </div>

      <ul
        className={`${styles.capabilities} ${
          tile.capabilityColumns === 2 ? styles.capabilitiesTwoCol : ''
        }`}
      >
        {tile.capabilities.map((capability) => (
          <CapabilityItem
            key={capability.id}
            label={capability.label}
            detail={capability.detail}
            Icon={capability.Icon}
          />
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
      id="toolkit"
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
