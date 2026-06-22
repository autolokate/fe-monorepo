"use client";

import { Badge } from "@/components/ui/badge";
import type { PreferenceSummaryRow } from "@/lib/advisor/preference-summary";
import { formatStepLabel } from "@/lib/advisor/step-utils";
import { cn } from "@/lib/utils";

export type PreferenceSummaryFieldsProps = {
  rows: PreferenceSummaryRow[];
  /** Applied to the outer `<dl>` (include grid layout here). */
  className?: string;
  /** Grid span when `step_id === "must_haves"` (wider strip for chips). */
  mustHavesSpanClassName?: string;
};

/** Renders preference summary rows (labels + values / chip lists) — wizard + matched-results. */
export function PreferenceSummaryFields({
  rows,
  className,
  mustHavesSpanClassName = "sm:col-span-2",
}: PreferenceSummaryFieldsProps) {
  if (rows.length === 0) return null;

  return (
    <dl className={className}>
      {rows.map((row) => {
        const stepLabel = formatStepLabel(row.step_id);
        return (
          <div
            key={row.step_id}
            className={cn(
              "rounded-xl border border-border/60 bg-card px-3 py-2.5",
              row.step_id === "must_haves" && mustHavesSpanClassName,
            )}
          >
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {stepLabel}
            </dt>
            <dd className="mt-1 text-sm font-medium leading-relaxed text-foreground">
              {row.chipLabels && row.chipLabels.length > 0 ? (
                <div
                  className="flex flex-wrap gap-1.5"
                  role="list"
                  aria-label={`Selected ${stepLabel.toLowerCase()}`}
                >
                  {row.chipLabels.map((label, i) => (
                    <Badge
                      key={`${row.step_id}-${i}-${label}`}
                      variant="outline"
                      role="listitem"
                      className="border-border/70 bg-muted/25 px-2 py-0.5 text-[13px] font-medium normal-case leading-snug text-foreground"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : (
                row.line
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
