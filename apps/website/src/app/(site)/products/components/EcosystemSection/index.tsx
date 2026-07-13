import { Fragment } from "react";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ECOSYSTEM_COPY, ECOSYSTEM_NODES } from "./constants";
import styles from "./index.module.css";

export function EcosystemSection() {
  return (
    <section className={styles.section} aria-labelledby="ecosystem-heading">
      <div className={styles.container}>
        <h2 id="ecosystem-heading" className={styles.heading}>
          {ECOSYSTEM_COPY.heading}
        </h2>

        <ol className={styles.flow}>
          {ECOSYSTEM_NODES.map(({ id, title, description, accent, Icon }, index) => (
            <Fragment key={id}>
              <li className={styles.node} style={{ "--accent": accent } as CSSProperties}>
                <span className={styles.nodeIcon} aria-hidden>
                  <Icon className="h-6 w-6 stroke-[1.9]" />
                </span>
                <div className={styles.nodeCopy}>
                  <h3 className={styles.nodeTitle}>{title}</h3>
                  <p className={styles.nodeDescription}>{description}</p>
                </div>
              </li>

              {index < ECOSYSTEM_NODES.length - 1 && (
                <li className={styles.connector} aria-hidden>
                  <ArrowRight className={styles.arrowRight} />
                  <ArrowDown className={styles.arrowDown} />
                </li>
              )}
            </Fragment>
          ))}
        </ol>

        <p className={styles.footnote}>{ECOSYSTEM_COPY.footnote}</p>
      </div>
    </section>
  );
}
