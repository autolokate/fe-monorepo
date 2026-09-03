import Image from 'next/image';
import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import { FOUNDER_COPY } from './constants';
import styles from './index.module.css';

export function Founder() {
  const { eyebrow, quote, name, role } = FOUNDER_COPY;

  return (
    <section aria-labelledby="founder-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.editorial}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <blockquote id="founder-heading" className={styles.quote}>
            &ldquo;{quote}&rdquo;
          </blockquote>

          <p className={styles.context}>
            Autolokate exists for Indian roads: long corridors, shared vehicles, and the minutes
            after impact when the people who love you need clarity—not chaos.
          </p>
        </div>

        <div className={styles.byline}>
          <span className={styles.avatar}>
            <Image
              src={MARKETING_STORY_IMAGES.founderPortrait}
              alt={`${name}, ${role}`}
              fill
              sizes="64px"
              className={styles.avatarImage}
            />
          </span>
          <div className={styles.attribution}>
            <p className={styles.name}>{name}</p>
            <p className={styles.role}>{role}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
