"use client";

import { useState } from "react";
import { Check, ChevronDown, Contrast, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COMPARE_COPY,
  COMPARE_GROUPS,
  COMPARE_PLANS,
  type CompareCell,
} from "./constants";
import styles from "./index.module.css";

function CellValue({ value }: { value: CompareCell }) {
  if (value === true) {
    return (
      <span className={styles.yes}>
        <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden />
        <span className="sr-only">Included</span>
      </span>
    );
  }

  if (value === "partial") {
    return (
      <span className={styles.partial}>
        <Contrast className="h-4 w-4" aria-hidden />
        <span className="sr-only">Limited</span>
      </span>
    );
  }

  if (value === false) {
    return (
      <span className={styles.no} aria-hidden>
        –<span className="sr-only">Not included</span>
      </span>
    );
  }

  if ("badge" in value) {
    return (
      <span className={styles.badge}>
        <Star className="h-3 w-3 fill-current" aria-hidden />
        {value.badge}
      </span>
    );
  }

  return <span className={styles.price}>{value.price}</span>;
}

export function CompareTable() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className={styles.scroll}>
        <div className={cn(styles.table, !expanded && styles.collapsed)}>
          {/* Header */}
          <div className={styles.headRow}>
            <div className={styles.headFeature}>
              <h2 id="compare-plans-heading" className={styles.heading}>
                {COMPARE_COPY.heading}
              </h2>
            </div>
            {COMPARE_PLANS.map((plan) => (
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
                {plan.price ? (
                  <span className={styles.planPrice}>{plan.price}</span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Groups */}
          {COMPARE_GROUPS.map((group, groupIndex) => (
            <div
              key={group.id}
              className={cn(styles.group, groupIndex > 0 && styles.groupExtra)}
            >
              <div className={styles.groupTitle}>{group.title}</div>

              {group.rows.map(({ id, label, sub, Icon, cells }) => (
                <div key={id} className={styles.row}>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon} aria-hidden>
                      <Icon className="h-4 w-4 stroke-[1.75]" />
                    </span>
                    <span className={styles.featureText}>
                      <span className={styles.featureLabel}>{label}</span>
                      <span className={styles.featureSub}>{sub}</span>
                    </span>
                  </div>

                  {cells.map((cell, i) => (
                    <div
                      key={COMPARE_PLANS[i].id}
                      className={cn(
                        styles.cell,
                        COMPARE_PLANS[i].popular && styles.cellPopular,
                      )}
                    >
                      <CellValue value={cell} />
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
        onClick={() => setExpanded((v) => !v)}
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
