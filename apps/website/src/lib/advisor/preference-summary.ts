import type { AdvisorAnswerEntry, AdvisorStep } from "./types";
import { unwrapAdvisorResultsPayload } from "./normalize";
import {
  entryDisplayLine,
  humanizeOptionId,
  labelsForAnswerEntry,
} from "./step-utils";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** Read `filters_applied` from various advisor results envelope shapes. */
export function getFiltersApplied(payload: unknown): Record<string, unknown> | null {
  const pick = (obj: Record<string, unknown> | null): Record<string, unknown> | null => {
    if (!obj) return null;
    const fa = obj.filters_applied;
    return isRecord(fa) ? fa : null;
  };

  const inner = unwrapAdvisorResultsPayload(payload);
  let fa = pick(inner);
  if (fa) return fa;

  if (inner && isRecord(inner.results)) {
    fa = pick(inner.results as Record<string, unknown>);
    if (fa) return fa;
  }

  if (isRecord(payload) && isRecord(payload.data)) {
    const d = payload.data as Record<string, unknown>;
    fa = pick(d);
    if (fa) return fa;
    if (isRecord(d.results)) {
      fa = pick(d.results as Record<string, unknown>);
      if (fa) return fa;
    }
  }

  return null;
}

/** Budget from API is stored in rupees (e.g. 8 lakh → 800_000). */
export function formatBudgetRangePaise(minPaise: number, maxPaise: number): string {
  const minL = minPaise / 100_000;
  const maxL = maxPaise / 100_000;
  const fmt = (n: number) =>
    Number.isInteger(n) ? String(Math.round(n)) : String(Math.round(n * 10) / 10).replace(/\.0$/, "");
  if (minL === maxL) return `${fmt(minL)} Lakhs`;
  return `${fmt(minL)} - ${fmt(maxL)} Lakhs`;
}

function humanizeFuelFilterValue(slug: string): string {
  const s = slug.trim().toLowerCase();
  if (!s) return "—";
  return humanizeOptionId(`fuel_${s}`);
}

export type PreferenceSummaryRow = {
  step_id: string;
  line: string;
  /** Must-haves (and similar): render as chips when present. */
  chipLabels?: string[];
};

function summaryRowFromEntry(
  entry: AdvisorAnswerEntry,
  stepMap: Record<string, AdvisorStep>,
): PreferenceSummaryRow {
  const step = stepMap[entry.step_id];
  if (entry.step_id === "must_haves") {
    const chipLabels = labelsForAnswerEntry(entry, step);
    return {
      step_id: entry.step_id,
      line: chipLabels.length ? chipLabels.join(", ") : "—",
      chipLabels: chipLabels.length ? chipLabels : undefined,
    };
  }
  return {
    step_id: entry.step_id,
    line: entryDisplayLine(entry, step),
  };
}

/**
 * Rows for the wizard summary card. When the journey is complete, prefer
 * `filters_applied` from advisor results (aligned with ranking) and merge in
 * any extra answers (e.g. city) not present there.
 */
export function buildPreferenceSummaryRows(
  completed: boolean,
  answerHistory: AdvisorAnswerEntry[],
  stepMap: Record<string, AdvisorStep>,
  advisorResults: unknown,
): PreferenceSummaryRow[] {
  if (!completed) {
    return answerHistory.map((entry) => summaryRowFromEntry(entry, stepMap));
  }

  const filters = getFiltersApplied(advisorResults);
  const rows: PreferenceSummaryRow[] = [];
  const seen = new Set<string>();

  if (filters) {
    const bmin = filters.budget_min;
    const bmax = filters.budget_max;
    if (typeof bmin === "number" && typeof bmax === "number" && bmin >= 0 && bmax >= 0) {
      rows.push({ step_id: "budget", line: formatBudgetRangePaise(bmin, bmax) });
      seen.add("budget");
    }

    const uc = filters.use_case;
    if (typeof uc === "string" && uc.trim()) {
      rows.push({ step_id: "use_case", line: humanizeOptionId(uc) });
      seen.add("use_case");
    }

    const fs = filters.family_size;
    if (typeof fs === "string" && fs.trim()) {
      rows.push({ step_id: "family_size", line: humanizeOptionId(fs) });
      seen.add("family_size");
    }

    const ft = filters.fuel_type;
    if (typeof ft === "string" && ft.trim()) {
      rows.push({ step_id: "fuel_pref", line: humanizeFuelFilterValue(ft) });
      seen.add("fuel_pref");
    }

    const mh = filters.must_haves;
    if (Array.isArray(mh) && mh.length > 0) {
      const ids = mh.map((x) => String(x)).filter(Boolean);
      const chipLabels = ids.map((id) => humanizeOptionId(id));
      rows.push({
        step_id: "must_haves",
        line: chipLabels.join(", "),
        chipLabels,
      });
      seen.add("must_haves");
    }
  }

  for (const entry of answerHistory) {
    if (seen.has(entry.step_id)) continue;
    rows.push(summaryRowFromEntry(entry, stepMap));
  }

  if (rows.length > 0) return rows;

  return answerHistory.map((entry) => summaryRowFromEntry(entry, stepMap));
}
