import Image from 'next/image';
import { Activity, Headphones, Lock, ShieldCheck } from 'lucide-react';

import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

import { TRUST_COPY } from './constants';
import { TrustTestimonialCarousel } from './TrustTestimonialCarousel';
import styles from './trust.module.css';

const TRUST_PILLARS = [
  {
    icon: Headphones,
    title: '24/7 Control Center',
    desc: 'Dedicated operations team on standby every minute of every drive.',
  },
  {
    icon: Activity,
    title: 'Instant SOS Dispatch',
    desc: 'Live coordinates shared with family, ambulance, and response network.',
  },
  {
    icon: ShieldCheck,
    title: 'Vahan Verified',
    desc: 'Synced with official transport databases for authentic vehicle safety.',
  },
  {
    icon: Lock,
    title: 'Privacy Protected',
    desc: 'Masked calls, encrypted communication, and zero data sharing.',
  },
];

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
        {/* Trust Header & Credibility Pillars */}
        <div className={styles.pillarsPanel}>
          <div className={styles.pillarsHeader}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 id="trust-heading" className={styles.pillarsHeadline}>
              Built on reliability, safety, and unwavering trust.
            </h2>
          </div>

          <div className={styles.pillarsGrid}>
            {TRUST_PILLARS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={styles.pillarCard}>
                <span className={styles.pillarIconWrap} aria-hidden="true">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className={styles.pillarContent}>
                  <h3 className={styles.pillarTitle}>{title}</h3>
                  <p className={styles.pillarDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Executive Quote */}
        <div className={styles.founderCard}>
          <blockquote className={styles.founderBlock}>
            <p className={styles.quote}>&ldquo;{founderQuote}&rdquo;</p>
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
                <span className={styles.role}>{founderRole} &middot; Autolokate</span>
              </div>
            </footer>
          </blockquote>
        </div>

        {/* Real Customer Stories Carousel */}
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
