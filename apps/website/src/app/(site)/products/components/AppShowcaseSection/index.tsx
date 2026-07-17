import Image from 'next/image';
import { AppTileCta } from './AppTileCta';
import { FLAGSHIP_APP, FLAGSHIP_PHONE_IMAGE, PARTNER_APPS, SECTION_HEADER } from './constants';
import type { AppCapability } from './types';
import styles from './index.module.css';

function CapabilityList({ capabilities }: { capabilities: AppCapability[] }) {
  return (
    <ul className={styles.capabilities}>
      {capabilities.map(({ id, label, detail, Icon }) => (
        <li key={id} className={styles.capability}>
          <span className={styles.capabilityIcon} aria-hidden="true">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <p className={styles.capabilityText}>
            <span className={styles.capabilityLabel}>{label}</span>
            <span className={styles.capabilityDetail}> · {detail}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AppShowcaseSection() {
  return (
    <section className={styles.section} aria-labelledby="app-showcase-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {SECTION_HEADER.eyebrow}
          </p>
          <h2 id="app-showcase-heading" className={styles.heading}>
            {SECTION_HEADER.heading}{' '}
            <span className={styles.headingAccent}>{SECTION_HEADER.headingAccent}</span>
          </h2>
          <p className={styles.subheading}>{SECTION_HEADER.subheading}</p>
        </header>

        <div className={styles.showcase}>
          {/* Flagship consumer app — dark tile with the live-map phone. */}
          <article className={`${styles.tile} ${styles.flagship}`}>
            <div className={styles.identity}>
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

              <AppTileCta cta={FLAGSHIP_APP.cta} tone="light" />
            </div>

            <CapabilityList capabilities={FLAGSHIP_APP.capabilities} />

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

          {/* Partner apps — light tiles side by side. */}
          <div className={styles.partnerPair}>
            {PARTNER_APPS.map((app) => (
              <article key={app.id} className={`${styles.tile} ${styles.partnerTile}`}>
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

                <CapabilityList capabilities={app.capabilities} />

                <div className={styles.partnerCtaRow}>
                  <AppTileCta cta={app.cta} tone="dark" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
