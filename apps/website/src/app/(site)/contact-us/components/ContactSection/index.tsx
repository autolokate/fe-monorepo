import { ArrowUpRight } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { CHANNELS, CHANNELS_EYEBROW, FOLLOW_LINKS } from './constants';
import styles from './index.module.css';

export function ContactSection() {
  return (
    <section className={styles.section} aria-label="Contact form and direct channels">
      <div className={styles.card}>
        <ContactForm />

        <div className={styles.channels}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {CHANNELS_EYEBROW}
          </p>

          <ul className={styles.channelGrid}>
            {CHANNELS.map(({ key, Icon, label, value, href, external }) => (
              <li key={key}>
                <a
                  href={href}
                  className={styles.channel}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                >
                  <span className={styles.channelChip} aria-hidden="true">
                    <Icon className={styles.channelIcon} />
                  </span>
                  <span className={styles.channelText}>
                    <span className={styles.channelLabel}>{label}</span>
                    <span className={styles.channelValue}>{value}</span>
                  </span>
                  <ArrowUpRight className={styles.channelArrow} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <p className={styles.follow}>
            <span className={styles.followLabel}>Follow: </span>
            {FOLLOW_LINKS.map(({ id, label, href }, index) => (
              <span key={id}>
                {index > 0 ? <span className={styles.followSep}> · </span> : null}
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.followLink}
                >
                  {label}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
