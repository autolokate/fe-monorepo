import { BadgeCheck, Check } from "lucide-react";
import { PhoneCarousel } from "../PhoneCarousel";
import {
  MARKETPLACE_ASIDE,
  MARKETPLACE_CHECKLIST,
  MARKETPLACE_COPY,
  MARKETPLACE_PHONE_SHOTS,
} from "./constants";
import styles from "./index.module.css";

export function MarketplaceSection() {
  return (
    <section className={styles.section} aria-labelledby="marketplace-heading">
      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.index} aria-hidden>
            {MARKETPLACE_COPY.index}
          </span>
          <h2 id="marketplace-heading" className={styles.heading}>
            {MARKETPLACE_COPY.heading}
          </h2>
          <p className={styles.description}>{MARKETPLACE_COPY.description}</p>

          <ul className={styles.checklist}>
            {MARKETPLACE_CHECKLIST.map(({ id, label }) => (
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
          <PhoneCarousel shots={MARKETPLACE_PHONE_SHOTS} />
        </div>

        <aside className={styles.aside}>
          <span className={styles.asideIcon} aria-hidden>
            <BadgeCheck className="h-6 w-6 stroke-[1.9]" />
          </span>
          <h3 className={styles.asideHeading}>{MARKETPLACE_ASIDE.heading}</h3>
          <p className={styles.asideText}>{MARKETPLACE_ASIDE.description}</p>
        </aside>
      </div>
    </section>
  );
}
