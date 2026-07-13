import { Fragment } from "react";
import { RESPONSE_COPY, RESPONSE_OUTCOMES, RESPONSE_STEPS } from "./constants";
import styles from "./index.module.css";

export function ResponseFlowSection() {
  return (
    <section className={styles.section} aria-labelledby="response-flow-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{RESPONSE_COPY.eyebrow}</span>
          <h2 id="response-flow-heading" className={styles.title}>
            {RESPONSE_COPY.title}
          </h2>
        </header>

        <div className={styles.flow}>
          {RESPONSE_STEPS.map(({ id, title, body, Icon }, i) => (
            <Fragment key={id}>
              <article className={styles.step}>
                <div className={styles.stepHead}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <h3 className={styles.stepTitle}>{title}</h3>
                </div>
                <span className={styles.stepIcon} aria-hidden>
                  <Icon className="h-9 w-9 stroke-[1.6]" />
                </span>
                <p className={styles.stepBody}>{body}</p>
              </article>

              <span className={styles.connector} aria-hidden />
            </Fragment>
          ))}

          <aside className={styles.outcomes}>
            <ul className={styles.outcomeList}>
              {RESPONSE_OUTCOMES.map(({ id, title, subtitle, Icon }) => (
                <li key={id} className={styles.outcome}>
                  <span className={styles.outcomeIcon} aria-hidden>
                    <Icon className="h-5 w-5 stroke-[1.8]" />
                  </span>
                  <span className={styles.outcomeText}>
                    <strong className={styles.outcomeTitle}>{title}</strong>
                    <span className={styles.outcomeSubtitle}>{subtitle}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
