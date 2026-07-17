import { socialLinks } from '@/layouts/Footer/constants';
import { SubscribeCta } from './SubscribeCta';
import { SUBSCRIBE_COPY } from './constants';
import styles from './index.module.css';

export function SubscribeSection() {
  const { eyebrow, headline, headlineAccent, subheading, socialsPrefix, socials } = SUBSCRIBE_COPY;

  const socialItems = socials
    .map((id) => socialLinks.find((link) => link.id === id))
    .filter((link): link is NonNullable<typeof link> => Boolean(link));

  return (
    <section aria-labelledby="media-subscribe-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headGroup}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="media-subscribe-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>
        </div>

        <p className={styles.subheading}>{subheading}</p>

        <SubscribeCta />

        <p className={styles.socialsNote}>
          {socialsPrefix}{' '}
          {socialItems.map((social, index) => (
            <span key={social.id}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                {social.label}
              </a>
              {index < socialItems.length - 2
                ? ', '
                : index === socialItems.length - 2
                  ? ' and '
                  : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
