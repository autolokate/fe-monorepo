import { PhoneCarousel } from '../PhoneCarousel';
import { DAILY_UTILITY_COPY, UTILITY_CARDS, UTILITY_PHONE_SHOTS } from './constants';
import styles from './index.module.css';

export function DailyUtilitySection() {
  return (
    <section className={styles.section} aria-labelledby="daily-utility-heading">
      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.index} aria-hidden>
            {DAILY_UTILITY_COPY.index}
          </span>
          <h2 id="daily-utility-heading" className={styles.heading}>
            {DAILY_UTILITY_COPY.heading}
          </h2>
          <p className={styles.description}>{DAILY_UTILITY_COPY.description}</p>

          <ul className={styles.cards}>
            {UTILITY_CARDS.map(({ id, title, subtitle, Icon }) => (
              <li key={id} className={styles.card}>
                <span className={styles.cardIcon} aria-hidden>
                  <Icon className="h-5 w-5 stroke-[1.9]" />
                </span>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardSub}>{subtitle}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.media}>
          <PhoneCarousel shots={UTILITY_PHONE_SHOTS} />
        </div>
      </div>
    </section>
  );
}
