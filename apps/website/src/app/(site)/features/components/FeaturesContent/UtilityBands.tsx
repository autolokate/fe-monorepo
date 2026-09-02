import { UTILITY_BANDS } from './constants';
import styles from './utility-bands.module.css';

export function UtilityBands() {
  return (
    <section className={styles.section} aria-labelledby="utility-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            Beyond emergencies
          </p>
          <h2 id="utility-heading" className={styles.headline}>
            The app you return to every week.
          </h2>
          <p className={styles.intro}>
            Protection is why you join. Challans, renewals, garages, and your driver score are why
            you stay.
          </p>
        </header>

        <div className={styles.bands}>
          {UTILITY_BANDS.map((band) => (
            <article key={band.id} className={styles.band}>
              <div className={styles.bandHead}>
                <h3 className={styles.bandTitle}>{band.title}</h3>
                <p className={styles.bandSubtitle}>{band.subtitle}</p>
              </div>
              <ul className={styles.items}>
                {band.items.map((item) => (
                  <li key={item} className={styles.item}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
