import Image from 'next/image';

import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

import { TRUST_COPY } from './constants';
import { TrustTestimonialCarousel } from './TrustTestimonialCarousel';
import styles from './trust.module.css';

export function TrustMomentSection() {
  const {
    eyebrow,
    founderQuote,
    founderName,
    founderRole,
    founderImageAlt,
    storiesEyebrow,
    storiesHeadline,
    storiesHeadlineAccent,
  } = TRUST_COPY;

  return (
    <section className={styles.section} aria-labelledby="trust-heading">
      <div className={styles.inner}>
        <div className={styles.founderPanel}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <blockquote className={styles.founderBlock}>
            <p className={styles.quote} id="trust-heading">
              &ldquo;{founderQuote}&rdquo;
            </p>
            <footer className={styles.founderByline}>
              <div className={styles.founderAvatar}>
                <Image
                  src={MARKETING_STORY_IMAGES.founderPortrait}
                  alt={founderImageAlt}
                  fill
                  className={styles.founderPhoto}
                  sizes="80px"
                />
              </div>
              <div className={styles.attribution}>
                <span className={styles.name}>{founderName}</span>
                <span className={styles.role}>{founderRole}</span>
              </div>
            </footer>
          </blockquote>
        </div>

        <div className={styles.storiesBlock}>
          <header className={styles.storiesHeader}>
            <p className={styles.storiesEyebrow}>
              <span className={styles.storiesEyebrowLine} aria-hidden="true" />
              {storiesEyebrow}
            </p>
            <h3 className={styles.storiesHeadline}>
              {storiesHeadline}{' '}
              <span className={styles.storiesAccent}>{storiesHeadlineAccent}</span>
            </h3>
          </header>

          <TrustTestimonialCarousel />
        </div>
      </div>
    </section>
  );
}
