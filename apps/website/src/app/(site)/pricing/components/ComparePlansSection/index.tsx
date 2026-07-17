import { Fragment } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { CompareCta } from './CompareCta';
import { COMPARE_COLUMNS, COMPARE_COPY, COMPARE_GROUPS } from './constants';
import styles from './index.module.css';

export function ComparePlansSection() {
  return (
    <section className={styles.section} aria-labelledby="compare-plans-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {COMPARE_COPY.eyebrow}
          </p>

          <h2 id="compare-plans-heading" className={styles.headline}>
            {COMPARE_COPY.headline}{' '}
            <span className={styles.headlineAccent}>{COMPARE_COPY.headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{COMPARE_COPY.subheading}</p>
        </header>

        <div className={styles.matrixCard}>
          <div className={styles.scroll}>
            <div className={styles.table}>
              {/* Continuous highlight behind the "Shield" column. */}
              <span className={styles.columnHighlight} aria-hidden="true" />

              {/* Header */}
              <div className={styles.headRow}>
                <div className={styles.headBlank} aria-hidden="true" />
                {COMPARE_COLUMNS.map((col) => (
                  <div key={col.id} className={styles.headPlan}>
                    {col.badge ? <span className={styles.popularPill}>{col.badge}</span> : null}
                    <span className={styles.planName}>{col.name}</span>
                    <span className={styles.planPrice}>{col.price}</span>
                  </div>
                ))}
              </div>

              {/* Groups */}
              {COMPARE_GROUPS.map((group) => (
                <Fragment key={group.id}>
                  <div className={styles.groupTitle}>{group.title}</div>

                  {group.rows.map((row) => (
                    <Fragment key={row.id}>
                      <div className={styles.row}>
                        <div className={styles.feature}>{row.label}</div>
                        {row.cells.map((included, i) => (
                          <div key={COMPARE_COLUMNS[i].id} className={styles.cell}>
                            {included ? (
                              <span className={styles.yes}>
                                <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                                <span className="sr-only">Included</span>
                              </span>
                            ) : (
                              <span className={styles.no} aria-hidden="true">
                                –<span className="sr-only">Not included</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className={styles.divider} aria-hidden="true" />
                    </Fragment>
                  ))}
                </Fragment>
              ))}

              {/* CTA row */}
              <div className={styles.ctaRow}>
                <div className={styles.headBlank} aria-hidden="true" />
                {COMPARE_COLUMNS.map((col) => (
                  <div key={col.id} className={styles.ctaCell}>
                    <CompareCta label={col.ctaLabel} href={col.ctaHref} popular={col.popular} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className={styles.handoff}>
          {COMPARE_COPY.handoff}{' '}
          <Link href={COMPARE_COPY.handoffLink.href} className={styles.handoffLink}>
            {COMPARE_COPY.handoffLink.label} →
          </Link>
        </p>
      </div>
    </section>
  );
}
