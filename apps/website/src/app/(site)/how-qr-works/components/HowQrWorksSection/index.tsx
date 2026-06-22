import { ShieldCheck } from "lucide-react";
import { HOW_QR_WORKS_COPY, HOW_QR_WORKS_SECTION_ID, HOW_QR_WORKS_STEPS } from "./constants";
import styles from "./index.module.css";

export function HowQrWorksSection() {
  return (
    <section
      id={HOW_QR_WORKS_SECTION_ID}
      className={styles.section}
      aria-labelledby="shop-how-qr-works-heading"
    >
      <div className={styles.inner}>
        <span className={styles.badge}>{HOW_QR_WORKS_COPY.eyebrow}</span>

        <h2 id="shop-how-qr-works-heading" className={styles.headline}>
          {HOW_QR_WORKS_COPY.headline}
        </h2>

        <p className={styles.subheading}>{HOW_QR_WORKS_COPY.subheading}</p>

        <div className={styles.stepsWrap}>
          <ol className={styles.steps}>
            {HOW_QR_WORKS_STEPS.map(({ id, step, title, body, Icon }) => (
              <li
                key={id}
                className={`${styles.step}${id === "choose" ? ` ${styles.stepHighlight}` : ""}`}
              >
                <div className={styles.iconStage}>
                  <div className={styles.iconWrap} aria-hidden>
                    <Icon className="h-[1.35rem] w-[1.35rem] stroke-[1.5] text-[#0a0a0a]" />
                    <span className={styles.stepNumber}>{step}</span>
                  </div>
                </div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepBody}>{body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.privacyBanner}>
          <span className={styles.privacyIcon} aria-hidden>
            <ShieldCheck className="h-[1.125rem] w-[1.125rem] stroke-[1.5]" />
          </span>
          <div className="min-w-0">
            <h3 className={styles.privacyTitle}>{HOW_QR_WORKS_COPY.privacyTitle}</h3>
            <p className={styles.privacyBody}>{HOW_QR_WORKS_COPY.privacyBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
