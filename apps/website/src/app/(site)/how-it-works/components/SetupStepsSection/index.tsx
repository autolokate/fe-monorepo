import { Fragment } from 'react';
import { SETUP_STEPS, SETUP_STEPS_COPY } from './constants';
import styles from './index.module.css';

export function SetupStepsSection() {
  return (
    <section className={styles.section} aria-labelledby="setup-steps-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.eyebrowRow}>
            <span className={styles.badge}>{SETUP_STEPS_COPY.eyebrow}</span>
            <span className={styles.eyebrowLine} aria-hidden />
          </div>
          <h2 id="setup-steps-heading" className={styles.headline}>
            {SETUP_STEPS_COPY.headline}
          </h2>
          <p className={styles.subheadline}>{SETUP_STEPS_COPY.subheadline}</p>
        </header>

        {/* Desktop — horizontal card row with dotted connectors */}
        <ol className={styles.rowDesktop}>
          {SETUP_STEPS.map(({ id, step, title, body, Icon }, index) => (
            <Fragment key={id}>
              <li className={styles.cardWrap}>
                <article className={styles.card}>
                  <span className={styles.stepBadge} aria-hidden>
                    {step}
                  </span>
                  <span className={styles.iconWrap} aria-hidden>
                    <Icon className="h-6 w-6 stroke-[1.75]" />
                  </span>
                  <div className={styles.cardText}>
                    <h3 className={styles.cardTitle}>{title}</h3>
                    <p className={styles.cardBody}>{body}</p>
                  </div>
                </article>
              </li>

              {index < SETUP_STEPS.length - 1 ? (
                <li className={styles.connector} aria-hidden>
                  <span className={styles.connectorDot} />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>

        {/* Mobile — vertical timeline with numbered rail */}
        <ol className={styles.colMobile}>
          {SETUP_STEPS.map(({ id, step, title, body, Icon }, index) => {
            const isLast = index === SETUP_STEPS.length - 1;

            return (
              <li key={id} className={styles.mobileItem}>
                <div className={styles.rail}>
                  {!isLast ? <span className={styles.spine} aria-hidden /> : null}
                  <span className={styles.stepBadge} aria-hidden>
                    {step}
                  </span>
                </div>

                <article className={styles.card}>
                  <span className={styles.iconWrap} aria-hidden>
                    <Icon className="h-6 w-6 stroke-[1.75]" />
                  </span>
                  <div className={styles.cardText}>
                    <h3 className={styles.cardTitle}>{title}</h3>
                    <p className={styles.cardBody}>{body}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
