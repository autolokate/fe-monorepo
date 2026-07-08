import { Check, TrendingUp } from "lucide-react";
import { PhoneCarousel } from "../PhoneCarousel";
import {
  DRIVER_SCORE_ASIDE,
  DRIVER_SCORE_CHECKLIST,
  DRIVER_SCORE_COPY,
  DRIVER_SCORE_PHONE_SHOTS,
} from "./constants";
import styles from "./index.module.css";

export function DriverScoreSection() {
  return (
    <section className={styles.section} aria-labelledby="driver-score-heading">
      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.index} aria-hidden>
            {DRIVER_SCORE_COPY.index}
          </span>
          <h2 id="driver-score-heading" className={styles.heading}>
            {DRIVER_SCORE_COPY.heading}
          </h2>
          <p className={styles.description}>{DRIVER_SCORE_COPY.description}</p>

          <ul className={styles.checklist}>
            {DRIVER_SCORE_CHECKLIST.map(({ id, label }) => (
              <li key={id} className={styles.checkItem}>
                <span className={styles.checkIcon} aria-hidden>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.media}>
          <PhoneCarousel shots={DRIVER_SCORE_PHONE_SHOTS} />
        </div>

        <aside className={styles.aside}>
          <span className={styles.asideIcon} aria-hidden>
            <TrendingUp className="h-6 w-6 stroke-[1.9]" />
          </span>
          <h3 className={styles.asideHeading}>{DRIVER_SCORE_ASIDE.heading}</h3>
          <p className={styles.asideText}>{DRIVER_SCORE_ASIDE.description}</p>
        </aside>
      </div>
    </section>
  );
}
