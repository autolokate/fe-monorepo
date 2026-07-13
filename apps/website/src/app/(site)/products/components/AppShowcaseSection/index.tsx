import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { AppDemoVideo } from "./AppDemoVideo";
import { APP_SHOWCASE_COPY, APP_SHOWCASE_ITEMS } from "./constants";
import { StoreBadges } from "./StoreBadges";
import styles from "./index.module.css";

export function AppShowcaseSection() {
  return (
    <section className={styles.section} aria-labelledby="app-showcase-heading">
      <div className={styles.intro}>
        <span className={styles.eyebrow}>{APP_SHOWCASE_COPY.eyebrow}</span>
        <h2 id="app-showcase-heading" className={styles.heading}>
          {APP_SHOWCASE_COPY.heading}
        </h2>
        <p className={styles.description}>{APP_SHOWCASE_COPY.description}</p>
      </div>

      <div className={styles.rows}>
        {APP_SHOWCASE_ITEMS.map((app, index) => {
          const { id, name, tagline, accent, Icon, features, videoSrc, poster, stores } =
            app;
          const rowClass =
            index % 2 === 0 ? `${styles.row} ${styles.reversed}` : styles.row;

          return (
            <div
              key={id}
              className={rowClass}
              style={{ "--accent": accent } as CSSProperties}
            >
              <div className={styles.copy}>
                <div className={styles.appHeader}>
                  <span className={styles.appIcon} aria-hidden>
                    <Icon className="h-5 w-5 stroke-[1.9]" />
                  </span>
                  <div>
                    <h3 className={styles.appName}>{name}</h3>
                    <p className={styles.appTagline}>{tagline}</p>
                  </div>
                </div>

                <ul className={styles.features}>
                  {features.map((feature) => (
                    <li key={feature} className={styles.feature}>
                      <span className={styles.featureCheck} aria-hidden>
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <StoreBadges ios={stores.ios} android={stores.android} appName={name} />
              </div>

              <div className={styles.media}>
                <AppDemoVideo src={videoSrc} poster={poster} label={name} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
