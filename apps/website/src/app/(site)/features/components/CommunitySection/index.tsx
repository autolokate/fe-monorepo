import { Check, Users } from "lucide-react";
import { PhoneCarousel } from "../PhoneCarousel";
import {
  COMMUNITY_ASIDE,
  COMMUNITY_CHECKLIST,
  COMMUNITY_COPY,
  COMMUNITY_PHONE_SHOTS,
} from "./constants";
import styles from "./index.module.css";

export function CommunitySection() {
  return (
    <section className={styles.section} aria-labelledby="community-heading">
      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.index} aria-hidden>
            {COMMUNITY_COPY.index}
          </span>
          <h2 id="community-heading" className={styles.heading}>
            {COMMUNITY_COPY.heading}
          </h2>
          <p className={styles.description}>{COMMUNITY_COPY.description}</p>

          <ul className={styles.checklist}>
            {COMMUNITY_CHECKLIST.map(({ id, label }) => (
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
          <PhoneCarousel shots={COMMUNITY_PHONE_SHOTS} />
        </div>

        <aside className={styles.aside}>
          <span className={styles.asideIcon} aria-hidden>
            <Users className="h-6 w-6 stroke-[1.9]" />
          </span>
          <h3 className={styles.asideHeading}>{COMMUNITY_ASIDE.heading}</h3>
          <p className={styles.asideText}>{COMMUNITY_ASIDE.description}</p>
        </aside>
      </div>
    </section>
  );
}
