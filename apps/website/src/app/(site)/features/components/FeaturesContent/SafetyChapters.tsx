import Image from 'next/image';
import {
  ControlCenterVisual,
  DetectionRadarVisual,
  ResponseHubVisual,
  SmartQrEcosystemVisual,
} from '@/components/marketing/StoryCinematicVisual';
import { SAFETY_CHAPTERS } from './constants';
import styles from './safety-chapters.module.css';

const SURFACE_CLASS = {
  light: styles.surfaceLight,
  dark: styles.surfaceDark,
  stone: styles.surfaceStone,
} as const;

function ChapterVisual({
  chapterId,
  image,
  imageAlt,
}: {
  chapterId: string;
  image?: string;
  imageAlt?: string;
}) {
  if (chapterId === 'detection') {
    return <DetectionRadarVisual />;
  }

  if (chapterId === 'control') {
    return <ControlCenterVisual />;
  }

  if (chapterId === 'response') {
    return (
      <div className={styles.visualBleed}>
        <ResponseHubVisual />
      </div>
    );
  }

  if (chapterId === 'smart-qr') {
    return <SmartQrEcosystemVisual />;
  }

  if (!image) return null;

  return (
    <Image
      src={image}
      alt={imageAlt ?? ''}
      width={900}
      height={600}
      className={`${styles.image} ${chapterId === 'smart-qr' ? styles.imageContain : ''}`}
      sizes="(min-width: 1024px) 45vw, 100vw"
    />
  );
}

export function SafetyChapters() {
  return (
    <div className={styles.wrap}>
      {SAFETY_CHAPTERS.map((chapter, index) => {
        const isSplit = chapter.layout === 'split-left' || chapter.layout === 'split-right';
        const isFullBleed = chapter.layout === 'full-bleed';

        return (
          <section
            key={chapter.id}
            aria-labelledby={`chapter-${chapter.id}`}
            className={`${styles.chapter} ${SURFACE_CLASS[chapter.surface]} ${
              chapter.layout === 'split-left' ? styles.splitLeft : ''
            } ${chapter.layout === 'split-right' ? styles.splitRight : ''} ${
              chapter.layout === 'text-only' ? styles.textOnly : ''
            }`}
          >
            {isFullBleed && chapter.image ? (
              <div className={styles.bleedMedia} aria-hidden="true">
                <Image
                  src={chapter.image}
                  alt=""
                  fill
                  className={styles.bleedImage}
                  sizes="100vw"
                />
                <div className={styles.bleedScrim} />
              </div>
            ) : null}

            <div className={styles.inner}>
              <div className={styles.copy}>
                <p className={styles.eyebrow}>
                  <span className={styles.index} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {chapter.eyebrow}
                </p>
                <h2 id={`chapter-${chapter.id}`} className={styles.headline}>
                  {chapter.headline}
                </h2>
                <p className={styles.body}>{chapter.body}</p>
                {chapter.detail ? <p className={styles.detail}>{chapter.detail}</p> : null}
              </div>

              {isSplit ? (
                <div className={styles.visual}>
                  <ChapterVisual
                    chapterId={chapter.id}
                    image={chapter.image}
                    imageAlt={chapter.imageAlt}
                  />
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
