/* eslint-disable @next/next/no-img-element -- decorative brand-mark SVG, no optimization benefit */
import { Play } from 'lucide-react';
import { FEATURED_VIDEO, MORE_VIDEOS, VIDEO_LIST, VIDEOS_COPY } from './constants';
import type { VideoItem } from './types';
import styles from './index.module.css';

const PLAY_GLYPH = {
  sm: 'h-[15px] w-[15px]',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

function PlayBadge({ size }: { size: keyof typeof PLAY_GLYPH }) {
  const sizeClass = size === 'lg' ? styles.playLg : size === 'md' ? styles.playMd : styles.playSm;
  return (
    <span className={`${styles.play} ${sizeClass}`} aria-hidden="true">
      <Play className={PLAY_GLYPH[size]} fill="currentColor" strokeWidth={0} />
    </span>
  );
}

function ListRow({ item }: { item: VideoItem }) {
  const { Icon } = item;
  return (
    <li>
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.listItem}>
        <span className={styles.listThumb}>
          <Icon className={styles.thumbIcon} strokeWidth={1.9} aria-hidden="true" />
          <PlayBadge size="sm" />
        </span>
        <span className={styles.listCopy}>
          <span className={styles.listTitle}>{item.title}</span>
          <span className={styles.duration}>{item.duration}</span>
        </span>
        <span className={styles.listArrow} aria-hidden="true">
          →
        </span>
      </a>
    </li>
  );
}

export function VideosSection() {
  const { eyebrow, headline, headlineAccent, subheading, moreLabel, youtubeLabel, youtubeHref } =
    VIDEOS_COPY;
  const { Icon: FeaturedIcon } = FEATURED_VIDEO;

  return (
    <section aria-labelledby="media-videos-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="media-videos-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <div className={styles.featuredRow}>
          <a
            href={FEATURED_VIDEO.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.featured}
            aria-label={FEATURED_VIDEO.title}
          >
            <span className={styles.featuredThumb}>
              <FeaturedIcon className={styles.featuredIcon} strokeWidth={1.4} aria-hidden="true" />
              <img
                src="/brand/al-mark-dark.svg"
                alt=""
                aria-hidden="true"
                className={styles.mark}
              />
              <PlayBadge size="lg" />
            </span>
          </a>

          <a
            href={FEATURED_VIDEO.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.featuredMeta}
          >
            <span className={styles.tag}>{FEATURED_VIDEO.eyebrow}</span>
            <span className={styles.featuredTitle}>{FEATURED_VIDEO.title}</span>
            <span className={styles.duration}>{FEATURED_VIDEO.duration}</span>
          </a>

          <ul className={styles.list}>
            {VIDEO_LIST.map((item) => (
              <ListRow key={item.id} item={item} />
            ))}
          </ul>
        </div>

        <div className={styles.more}>
          <p className={styles.moreLabel}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {moreLabel}
          </p>

          <ul className={styles.moreList}>
            {MORE_VIDEOS.map((item) => {
              const { Icon } = item;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.moreRow}
                  >
                    <span className={styles.moreThumb}>
                      <Icon className={styles.moreIcon} strokeWidth={1.6} aria-hidden="true" />
                      <PlayBadge size="md" />
                    </span>
                    <span className={styles.moreCopy}>
                      <span className={styles.moreTitle}>{item.title}</span>
                      <span className={styles.duration}>{item.duration}</span>
                    </span>
                    <span className={styles.moreArrow} aria-hidden="true">
                      →
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <a href={youtubeHref} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
          <span className={styles.textLinkLabel}>{youtubeLabel}</span>{' '}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
