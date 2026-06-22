"use client";

import { Badge } from "@/components/ui/badge";
import type { PreferenceSummaryRow } from "@/lib/advisor/preference-summary";
import { formatStepLabel } from "@/lib/advisor/step-utils";
import { cn } from "@/lib/utils";

/** Short labels for compact chips (matched-results strip). */
const STEP_CHIP_PREFIX: Record<string, string> = {
  budget: "Budget",
  use_case: "Use",
  family_size: "Family",
  fuel_pref: "Fuel",
};

export type PreferenceSummaryChipsProps = {
  rows: PreferenceSummaryRow[];
  className?: string;
};

/**
 * Single wrapping row of chips — scalar prefs as `Budget · …` and must-haves as individual chips.
 */
export function PreferenceSummaryChips({ rows, className }: PreferenceSummaryChipsProps) {
  if (rows.length === 0) return null;

  return (
    <div
      className={cn("flex flex-wrap gap-1.5", className)}
      role="list"
      aria-label="Your saved preferences"
    >
      {rows.flatMap((row) => {
        const prefix = STEP_CHIP_PREFIX[row.step_id] ?? formatStepLabel(row.step_id);

        if (row.step_id === "must_haves" && row.chipLabels && row.chipLabels.length > 0) {
          return row.chipLabels.map((label, i) => (
            <Badge
              key={`${row.step_id}-${i}-${label}`}
              variant="outline"
              role="listitem"
              title={`Must have: ${label}`}
              className="border-border/70 bg-muted/20 px-2 py-0.5 text-[12px] font-medium normal-case leading-snug text-foreground"
            >
              {label}
            </Badge>
          ));
        }

        return [
          <Badge
            key={row.step_id}
            variant="outline"
            role="listitem"
            title={`${prefix}: ${row.line}`}
            className="border-border/70 bg-muted/20 px-2 py-0.5 text-[12px] font-medium normal-case leading-snug text-foreground"
          >
            <span className="text-muted-foreground">{prefix}</span>
            <span className="mx-1 opacity-50" aria-hidden>
              ·
            </span>
            <span>{row.line}</span>
          </Badge>,
        ];
      })}
    </div>
  );
}
