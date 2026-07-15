import { contactCards, socials } from './constants';
import styles from './index.module.css';

export function Sidebar() {
  return (
    <aside className={styles.card} aria-label="Contact information">
      <h3 className={styles.title}>Contact Information</h3>

      <ul className={styles.list}>
        {contactCards.map(({ key, Icon, label, primary, href, brandColor }) => (
          <li key={key} className={styles.row}>
            <span
              className={styles.iconWrap}
              aria-hidden="true"
              data-contact={key}
              style={{ '--contact-brand': brandColor } as React.CSSProperties}
            >
              <Icon />
            </span>
            <div className={styles.rowText}>
              <p className={styles.label}>{label}</p>
              {href ? (
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`${styles.value} ${styles.valueLink}`}
                >
                  {primary}
                </a>
              ) : (
                <p className={styles.value}>{primary}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.social}>
        <p className={styles.socialLabel}>Follow us</p>
        <ul className={styles.socialList}>
          {socials.map(({ id, label, href, Icon, brandColor }) => (
            <li key={id}>
              <a
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                data-social={id}
                style={{ '--social-brand': brandColor } as React.CSSProperties}
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
