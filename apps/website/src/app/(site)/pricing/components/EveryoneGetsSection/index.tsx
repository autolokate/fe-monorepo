import { EVERYONE_GETS_COPY, EVERYONE_GETS_ICONS } from './constants';
import styles from './index.module.css';

export function EveryoneGetsSection() {
  return (
    <section className={styles.section} aria-labelledby="everyone-gets-heading">
      <div className={styles.container}>
        <div className={styles.card}>
          <ul className={styles.icons}>
            {EVERYONE_GETS_ICONS.map(({ id, label, Icon }) => (
              <li key={id} className={styles.iconBadge}>
                <Icon className="h-5 w-5 stroke-[1.9]" aria-hidden />
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.copy}>
            <h2 id="everyone-gets-heading" className={styles.heading}>
              {EVERYONE_GETS_COPY.heading}
            </h2>
            <p className={styles.description}>{EVERYONE_GETS_COPY.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
