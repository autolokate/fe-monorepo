'use client';

import { Check } from 'lucide-react';
import { CompareCta } from './CompareCta';
import { COMPARE_COLUMNS, COMPARE_GROUPS } from './constants';
import styles from './mobile.module.css';

export function ComparePlansMobile() {
  return (
    <div className={styles.stack} aria-label="Compare plans">
      {COMPARE_COLUMNS.map((col, colIndex) => {
        const features = COMPARE_GROUPS.flatMap((group) =>
          group.rows
            .filter((row) => row.cells[colIndex])
            .map((row) => ({ id: row.id, label: row.label, group: group.title })),
        );

        return (
          <article
            key={col.id}
            className={`${styles.planCard} ${col.popular ? styles.planCardPopular : ''}`}
          >
            {col.badge ? <span className={styles.badge}>{col.badge}</span> : null}

            <header className={styles.planHead}>
              <h3 className={styles.planName}>{col.name}</h3>
              <p className={styles.planPrice}>{col.price}</p>
            </header>

            <ul className={styles.featureList}>
              {features.map((feature) => (
                <li key={feature.id} className={styles.featureItem}>
                  <Check className={styles.checkIcon} aria-hidden="true" />
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>

            <CompareCta label={col.ctaLabel} href={col.ctaHref} popular={col.popular} />
          </article>
        );
      })}
    </div>
  );
}
