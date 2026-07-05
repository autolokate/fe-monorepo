import { Fragment } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import {
  QR_BACKUP_COPY,
  QR_BACKUP_IMAGE,
  QR_FEATURES,
  QR_FLOW_STEPS,
} from "./constants";
import styles from "./index.module.css";

export function QrBackupSection() {
  return (
    <section className={styles.section} aria-labelledby="qr-backup-heading">
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.left}>
            <header className={styles.header}>
              <span className={styles.eyebrow}>{QR_BACKUP_COPY.eyebrow}</span>
              <h2 id="qr-backup-heading" className={styles.headline}>
                {QR_BACKUP_COPY.headline}
              </h2>
              <p className={styles.subheadline}>{QR_BACKUP_COPY.subheadline}</p>
            </header>

            <div className={styles.showcase}>
              <Image
                src={QR_BACKUP_IMAGE}
                alt="Autolokate Scan for Help QR sticker with a vehicle ID"
                width={1131}
                height={1391}
                className={styles.qr}
                sizes="(max-width: 640px) 60vw, 13rem"
              />

              <div className={styles.flow}>
                <span className={styles.flowLabel}>
                  {QR_BACKUP_COPY.flowLabel}
                  <span className={styles.flowLabelLine} aria-hidden />
                </span>

                <ol className={styles.flowSteps}>
                  {QR_FLOW_STEPS.map(({ id, title, body, Icon }, index) => (
                    <Fragment key={id}>
                      <li className={styles.flowStep}>
                        <span className={styles.flowIcon} aria-hidden>
                          <Icon className="h-5 w-5 stroke-[1.6]" />
                        </span>
                        <h3 className={styles.flowTitle}>{title}</h3>
                        <p className={styles.flowBody}>{body}</p>
                      </li>

                      {index < QR_FLOW_STEPS.length - 1 ? (
                        <li className={styles.flowArrow} aria-hidden>
                          <ArrowRight className="h-4 w-4" />
                        </li>
                      ) : null}
                    </Fragment>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <ul className={styles.features}>
            {QR_FEATURES.map(({ id, title, body, Icon }) => (
              <li key={id} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden>
                  <Icon className="h-5 w-5 stroke-[1.75]" />
                </span>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>{title}</h3>
                  <p className={styles.featureBody}>{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.banner}>
          <span className={styles.bannerIcon} aria-hidden>
            <ShieldCheck className="h-5 w-5 stroke-[1.75]" />
          </span>
          <span className={styles.bannerText}>{QR_BACKUP_COPY.bannerNote}</span>
        </div>
      </div>
    </section>
  );
}
