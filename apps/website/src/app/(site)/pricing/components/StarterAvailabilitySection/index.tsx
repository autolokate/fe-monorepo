import { ShieldCheck } from "lucide-react";
import { STARTER_COPY, STARTER_RETAILERS, type RetailerId } from "./constants";
import styles from "./index.module.css";

const RETAILER_CLASS: Record<RetailerId, string> = {
  blinkit: styles.blinkit,
  zepto: styles.zepto,
  amazon: styles.amazon,
};

export function StarterAvailabilitySection() {
  return (
    <section className={styles.section} aria-labelledby="starter-availability-heading">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.info}>
            <span className={styles.badge} aria-hidden>
              <ShieldCheck className="h-5 w-5 stroke-[2]" />
            </span>
            <div className={styles.text}>
              <p id="starter-availability-heading" className={styles.heading}>
                {STARTER_COPY.heading}
              </p>
              <p className={styles.description}>
                {STARTER_COPY.descriptionLead}{" "}
                <span className={styles.descriptionEmphasis}>
                  {STARTER_COPY.descriptionEmphasis}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.availability}>
            <span className={styles.availableLabel}>{STARTER_COPY.availableLabel}</span>
            <ul className={styles.retailers}>
              {STARTER_RETAILERS.map(({ id, label }) => (
                <li key={id} className={`${styles.retailer} ${RETAILER_CLASS[id]}`}>
                  <span className={styles.wordmark}>{label}</span>
                  {id === "amazon" ? (
                    <svg
                      className={styles.amazonSmile}
                      viewBox="0 0 64 14"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3 4c11 8 47 8 58 0"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M57 7.5 61 4l-4.2-1.6"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
