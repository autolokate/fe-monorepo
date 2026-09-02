import { TEAM_MEMBERS } from '../constants';
import styles from './index.module.css';

export function TeamGrid() {
  return (
    <section className={styles.section} aria-labelledby="team-grid-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            Core team
          </p>
          <h2 id="team-grid-heading" className={styles.heading}>
            The people building Autolokate.
          </h2>
        </header>

        <ul className={styles.grid}>
          {TEAM_MEMBERS.map((member, index) => (
            <li
              key={member.id}
              className={`${styles.card} ${member.leadership ? styles.cardLeadership : ''}`}
            >
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.body}>
                <h3 className={styles.name}>{member.name}</h3>
                <p className={styles.role}>{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
