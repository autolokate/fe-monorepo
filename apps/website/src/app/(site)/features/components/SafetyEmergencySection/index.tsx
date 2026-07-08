import { Check, ShieldCheck } from "lucide-react";
import { PhoneCarousel } from "../PhoneCarousel";
import {
  PHONE_SHOTS,
  SAFETY_ASIDE,
  SAFETY_CHECKLIST,
  SAFETY_EMERGENCY_COPY,
} from "./constants";
import styles from "./index.module.css";

export function SafetyEmergencySection() {
  return (
    <section className={styles.section} aria-labelledby="safety-emergency-heading">
      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.index} aria-hidden>
            {SAFETY_EMERGENCY_COPY.index}
          </span>
          <h2 id="safety-emergency-heading" className={styles.heading}>
            {SAFETY_EMERGENCY_COPY.heading}
          </h2>
          <p className={styles.description}>{SAFETY_EMERGENCY_COPY.description}</p>

          <ul className={styles.checklist}>
            {SAFETY_CHECKLIST.map(({ id, label }) => (
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
          <PhoneCarousel shots={PHONE_SHOTS} />
        </div>

        <aside className={styles.aside}>
          <span className={styles.asideIcon} aria-hidden>
            <ShieldCheck className="h-6 w-6 stroke-[1.9]" />
          </span>
          <h3 className={styles.asideHeading}>{SAFETY_ASIDE.heading}</h3>
          <p className={styles.asideText}>{SAFETY_ASIDE.description}</p>
        </aside>
      </div>
    </section>
  );
}
