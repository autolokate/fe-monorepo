import styles from './index.module.css';

export function StoreBadges() {
  return (
    <div className={styles.badges}>
      <a className={styles.badge} href="#download" aria-label="Get it on Google Play">
        <svg className={styles.badgeIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3.6 2.3 13.2 12 3.6 21.7c-.3-.2-.5-.6-.5-1V3.3c0-.4.2-.8.5-1z" fill="#34d399" />
          <path d="M16.9 8.3 5.4 1.8C5 1.6 4.6 1.6 4.3 1.8L14 11.5l2.9-3.2z" fill="#60a5fa" />
          <path d="M16.9 15.7 14 12.5 4.3 22.2c.3.2.7.2 1.1 0l11.5-6.5z" fill="#f87171" />
          <path d="m16.9 8.3-2.9 3.2 2.9 3.2 4-2.3c.6-.4.6-1.4 0-1.8l-4-2.3z" fill="#fbbf24" />
        </svg>
        <span className={styles.badgeText}>
          <small>GET IT ON</small>
          <strong>Google Play</strong>
        </span>
      </a>

      <a className={styles.badge} href="#download" aria-label="Download on the App Store">
        <svg className={styles.badgeIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="#ffffff"
            d="M16.5 12.3c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.4 2.1 2.4 2 1-.1 1.3-.6 2.5-.6s1.5.6 2.6.6 1.7-1 2.3-2c.7-1.1 1-2.2 1-2.3 0 0-2-.7-2.2-2.9z"
          />
          <path
            fill="#ffffff"
            d="M14.6 6.2c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.2-.5.5-.9 1.4-.8 2.3.9.1 1.7-.5 2.2-1.1z"
          />
        </svg>
        <span className={styles.badgeText}>
          <small>Download on the</small>
          <strong>App Store</strong>
        </span>
      </a>
    </div>
  );
}
