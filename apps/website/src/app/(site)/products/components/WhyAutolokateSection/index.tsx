import { WHY_COPY, WHY_POINTS } from './constants';
import styles from './index.module.css';

export function WhyAutolokateSection() {
  return (
    <section className={styles.section} aria-labelledby="why-autolokate-heading">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.copy}>
            <h2 id="why-autolokate-heading" className={styles.heading}>
              {WHY_COPY.heading}
            </h2>
            <p className={styles.description}>{WHY_COPY.description}</p>
          </div>

          <ul className={styles.points}>
            {WHY_POINTS.map(({ id, title, description, Icon }) => (
              <li key={id} className={styles.point}>
                <span className={styles.iconBadge} aria-hidden>
                  <Icon className="h-5 w-5 stroke-[1.9]" />
                </span>
                <div>
                  <h3 className={styles.pointTitle}>{title}</h3>
                  <p className={styles.pointDescription}>{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
