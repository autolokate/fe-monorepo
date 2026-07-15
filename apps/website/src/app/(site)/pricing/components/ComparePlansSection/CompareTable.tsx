'use client';

import { type CSSProperties, useMemo, useState } from 'react';
import { Check, ChevronDown, Star } from 'lucide-react';
import { useSafetyPlans } from '@/hooks/plans';
import { cn } from '@/lib/utils';
import { COMPARE_COPY, buildCompareData } from './constants';
import styles from './index.module.css';

export function CompareTable() {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useSafetyPlans();
  const { columns, groups } = useMemo(() => buildCompareData(data ?? []), [data]);

  if (columns.length === 0) {
    return (
      <div className={styles.stateShell} role="status" aria-live="polite">
        <p className={styles.stateText}>
          {isLoading
            ? 'Loading plans…'
            : isError
              ? "We couldn't load plans right now. Please try again shortly."
              : 'No plans available right now.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.scroll}>
        <div
          className={cn(styles.table, !expanded && styles.collapsed)}
          style={{ '--plan-count': columns.length } as CSSProperties}
        >
          {/* Header */}
          <div className={styles.headRow}>
            <div className={styles.headFeature}>
              <h2 id="compare-plans-heading" className={styles.heading}>
                {COMPARE_COPY.heading}
              </h2>
            </div>
            {columns.map((plan) => (
              <div
                key={plan.id}
                className={cn(styles.headPlan, plan.popular && styles.headPlanPopular)}
              >
                {plan.popular ? (
                  <span className={styles.popularPill}>
                    <Star className="h-3 w-3 fill-current" aria-hidden />
                    Most Popular
                  </span>
                ) : null}
                <span className={styles.planName}>{plan.name}</span>
                {plan.price ? <span className={styles.planPrice}>{plan.price}</span> : null}
              </div>
            ))}
          </div>

          {/* Groups — one per tier that introduces features */}
          {groups.map((group, groupIndex) => (
            <div key={group.id} className={cn(styles.group, groupIndex > 0 && styles.groupExtra)}>
              <div className={styles.groupTitle}>{group.title}</div>

              {group.rows.map((row) => (
                <div key={row.id} className={styles.row}>
                  <div className={styles.feature}>
                    <span className={styles.featureText}>
                      <span className={styles.featureLabel}>{row.label}</span>
                    </span>
                  </div>

                  {row.cells.map((included, i) => (
                    <div
                      key={columns[i].id}
                      className={cn(styles.cell, columns[i].popular && styles.cellPopular)}
                    >
                      {included ? (
                        <span className={styles.yes}>
                          <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden />
                          <span className="sr-only">Included</span>
                        </span>
                      ) : (
                        <span className={styles.no} aria-hidden>
                          –<span className="sr-only">Not included</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        onClick={() => {
          setExpanded((v) => !v);
        }}
      >
        {expanded ? COMPARE_COPY.expandedLabel : COMPARE_COPY.collapsedLabel}
        <ChevronDown
          className={cn(styles.toggleChevron, expanded && styles.toggleChevronOpen)}
          aria-hidden
        />
      </button>
    </>
  );
}
