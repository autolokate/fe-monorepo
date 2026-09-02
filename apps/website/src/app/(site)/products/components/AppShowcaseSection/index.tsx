import Image from 'next/image';
import { AppTileCta } from './AppTileCta';
import { FLAGSHIP_APP, FLAGSHIP_PHONE_IMAGE, PARTNER_APPS, SECTION_HEADER } from './constants';
import type { AppCapability } from './types';
import styles from './index.module.css';

function CapabilityList({
  capabilities,
  tone,
}: {
  capabilities: AppCapability[];
  tone: 'dark' | 'light';
}) {
  return (
    <ul className={`${styles.capabilities} ${tone === 'dark' ? styles.capDark : styles.capLight}`}>
      {capabilities.map(({ id, label, detail }) => (
        <li key={id} className={styles.capability}>
          <span className={styles.capabilityLabel}>{label}</span>
          <span className={styles.capabilityDetail}>{detail}</span>
        </li>
      ))}
    </ul>
  );
}

export function AppShowcaseSection() {
  return (
    <section
      className={`mkt-section mkt-mutedBg ${styles.section}`}
      aria-labelledby="app-showcase-heading"
    >
      <div className={`mkt-container ${styles.inner}`}>
        <header className={styles.header}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            {SECTION_HEADER.eyebrow}
          </p>
          <h2 id="app-showcase-heading" className={`mkt-headline ${styles.heading}`}>
            {SECTION_HEADER.heading}{' '}
            <span className={styles.headingAccent}>{SECTION_HEADER.headingAccent}</span>
          </h2>
          <p className={`mkt-body ${styles.subheading}`}>{SECTION_HEADER.subheading}</p>
        </header>

        <article className={styles.flagship}>
          <div className={styles.flagshipCopy}>
            <div className={styles.tileHead}>
              <Image
                src={FLAGSHIP_APP.iconSrc}
                alt=""
                aria-hidden="true"
                width={44}
                height={44}
                className={styles.appIcon}
              />
              <div className={styles.nameGroup}>
                <h3 className={styles.appName}>{FLAGSHIP_APP.name}</h3>
                <p className={styles.appAudience}>{FLAGSHIP_APP.audience}</p>
              </div>
            </div>

            <CapabilityList capabilities={FLAGSHIP_APP.capabilities} tone="dark" />

            <AppTileCta cta={FLAGSHIP_APP.cta} tone="light" />
          </div>

          <div className={styles.device}>
            <Image
              src={FLAGSHIP_PHONE_IMAGE}
              alt="Autolokate app showing a live map with the Control Center standing by"
              width={314}
              height={400}
              className={styles.phone}
            />
          </div>
        </article>

        <div className={styles.partnerStack}>
          {PARTNER_APPS.map((app, index) => (
            <article key={app.id} className={styles.partner}>
              <span className={styles.partnerIndex}>{String(index + 1).padStart(2, '0')}</span>

              <div className={styles.partnerMain}>
                <div className={styles.tileHead}>
                  <Image
                    src={app.iconSrc}
                    alt=""
                    aria-hidden="true"
                    width={44}
                    height={44}
                    className={styles.appIcon}
                  />
                  <div className={styles.nameGroup}>
                    <h3 className={styles.appNameDark}>{app.name}</h3>
                    <p className={styles.appAudienceDark}>{app.audience}</p>
                  </div>
                </div>

                <CapabilityList capabilities={app.capabilities} tone="light" />

                <AppTileCta cta={app.cta} tone="dark" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
