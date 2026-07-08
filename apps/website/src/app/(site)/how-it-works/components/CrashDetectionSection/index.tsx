import { Fragment } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import {
  CRASH_DETECTION_COPY,
  CRASH_DETECTION_IMAGE,
  CRASH_FEATURES,
  CRASH_STEPS,
} from "./constants";
import styles from "./index.module.css";

export function CrashDetectionSection() {
  return (
    <section className={styles.section} aria-labelledby="crash-detection-heading">
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.left}>
            <header className={styles.header}>
              <span className={styles.eyebrow}>
                <ShieldCheck className="h-4 w-4 stroke-[1.9]" aria-hidden />
                {CRASH_DETECTION_COPY.eyebrow}
              </span>
              <h2 id="crash-detection-heading" className={styles.headline}>
                {CRASH_DETECTION_COPY.headlinePrefix}
                <span className={styles.headlineEmphasis}>
                  {CRASH_DETECTION_COPY.headlineEmphasis}
                </span>
                {CRASH_DETECTION_COPY.headlineSuffix}
              </h2>
              <p className={styles.subheadline}>{CRASH_DETECTION_COPY.subheadline}</p>
            </header>

            {/* Desktop — horizontal step flow with dashed arrows */}
            <ol className={styles.stepsDesktop}>
              {CRASH_STEPS.map(({ id, step, title, body, Icon }, index) => (
                <Fragment key={id}>
                  <li className={styles.step}>
                    <span className={styles.stepIcon} aria-hidden>
                      <Icon className="h-7 w-7 stroke-[1.6]" />
                      <span className={styles.stepNumber}>{step}</span>
                    </span>
                    <h3 className={styles.stepTitle}>{title}</h3>
                    <p className={styles.stepBody}>{body}</p>
                  </li>

                  {index < CRASH_STEPS.length - 1 ? (
                    <li className={styles.connector} aria-hidden>
                      <span className={styles.connectorLine} />
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </ol>
          </div>

          <div className={styles.media}>
            <Image
              src={CRASH_DETECTION_IMAGE}
              alt="Autolokate Control Center showing an active incident with live location, alerts, and dispatch status"
              width={561}
              height={1024}
              className={styles.phone}
              sizes="(max-width: 1024px) 60vw, 20rem"
            />
          </div>
        </div>

        {/* Mobile / tablet — step grid */}
        <ol className={styles.stepsMobile}>
          {CRASH_STEPS.map(({ id, step, title, body, Icon }) => (
            <li key={id} className={styles.step}>
              <span className={styles.stepIcon} aria-hidden>
                <Icon className="h-7 w-7 stroke-[1.6]" />
                <span className={styles.stepNumber}>{step}</span>
              </span>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepBody}>{body}</p>
            </li>
          ))}
        </ol>

        {/* Feature strip */}
        <ul className={styles.featureStrip}>
          {CRASH_FEATURES.map(({ id, title, subtitle, Icon }) => (
            <li key={id} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden>
                <Icon className="h-5 w-5 stroke-[1.75]" />
              </span>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>{title}</span>
                <span className={styles.featureSub}>{subtitle}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Bottom banner */}
        <div className={styles.banner}>
          <span className={styles.bannerLeft}>
            <span className={styles.bannerIcon} aria-hidden>
              <ShieldCheck className="h-5 w-5 stroke-[1.75]" />
            </span>
            {CRASH_DETECTION_COPY.bannerNote}
          </span>
        </div>
      </div>
    </section>
  );
}
