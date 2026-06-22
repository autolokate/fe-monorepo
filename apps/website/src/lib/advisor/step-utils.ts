import type { AdvisorAnswerEntry, AdvisorStep, PromptSnapshot } from "./types";
import { CANONICAL_ADVISOR_OPTION_LABELS } from "./option-labels";

/** Known slug prefixes we strip so the line reads like a choice, not an id. */
const OPTION_CATEGORY_PREFIXES = new Set([
  "budget",
  "fuel",
  "use",
  "feat",
  "family",
  "body",
  "city",
  "must",
  "vehicle",
  "seat",
  "transmission",
  "drive",
  "range",
  "priority",
]);

const TOKEN_LABELS: Record<string, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  cng: "CNG",
  lpg: "LPG",
  daily: "Daily",
  commute: "commute",
  weekend: "Weekend",
  highway: "highway",
  trips: "trips",
  under: "Under",
  over: "Over",
  between: "Between",
  automatic: "Automatic transmission",
  manual: "Manual transmission",
  amt: "AMT",
  sunroof: "Sunroof",
  cruise: "Cruise control",
  leather: "Leather seats",
  touchscreen: "Touchscreen",
  camera: "Camera",
  parking: "Parking sensors",
};

export function formatStepLabel(stepId: string): string {
  return stepId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Converts API-style option ids (e.g. `budget_under_5`, `fuel_petrol`) into
 * short, readable copy when we don't have the step's option list (cold load).
 */
export function humanizeOptionId(id: string): string {
  const raw = id.trim();
  if (!raw) return "—";

  const canonical = CANONICAL_ADVISOR_OPTION_LABELS[raw];
  if (canonical) return canonical;

  const parts = raw.split("_").filter(Boolean);

  // Budget slugs not present in the canonical map (e.g. new bands from API).
  if (parts[0]?.toLowerCase() === "budget") {
    const tail = parts.slice(1);
    if (tail.length === 2 && tail[0] && tail[1] && tail.every((t) => /^\d+$/.test(t))) {
      return `${tail[0]} - ${tail[1]} Lakhs`;
    }
    if (
      tail.length === 2 &&
      tail[0]?.toLowerCase() === "under" &&
      tail[1] &&
      /^\d+$/.test(tail[1])
    ) {
      return `Under ${tail[1]} Lakhs`;
    }
    if (
      tail.length === 2 &&
      tail[0] &&
      tail[1]?.toLowerCase() === "plus" &&
      /^\d+$/.test(tail[0])
    ) {
      return `${tail[0]} Lakhs+`;
    }
  }

  // Family slug patterns not in the canonical map.
  if (parts[0]?.toLowerCase() === "family") {
    const tail = parts.slice(1);
    if (tail.length === 2 && tail[0] && tail[1] && tail.every((t) => /^\d+$/.test(t))) {
      return `${tail[0]}-${tail[1]} people`;
    }
    if (tail.length === 2 && tail[0] && /^\d+$/.test(tail[0]) && tail[1]?.toLowerCase() === "plus") {
      return `${tail[0]}+ people`;
    }
  }

  if (parts.length === 1) {
    const w = parts[0].toLowerCase();
    return TOKEN_LABELS[w] ?? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }

  let start = 0;
  if (OPTION_CATEGORY_PREFIXES.has(parts[0].toLowerCase())) start = 1;
  const rest = parts.slice(start);
  if (rest.length === 0) {
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  }

  // Budget bands: under_5 → Under ₹5 lakh
  if (rest[0]?.toLowerCase() === "under" && rest[1] && /^\d+(\.\d+)?$/.test(rest[1])) {
    return `Under ₹${rest[1]} lakh`;
  }
  if (rest[0]?.toLowerCase() === "over" && rest[1] && /^\d+(\.\d+)?$/.test(rest[1])) {
    return `Over ₹${rest[1]} lakh`;
  }

  // Family size: lone digit
  if (rest.length === 1 && /^\d+$/.test(rest[0])) {
    const n = rest[0];
    return n === "1" ? "1 person" : `Up to ${n} people`;
  }

  const words = rest.map((word) => {
    const w = word.toLowerCase();
    if (/^\d+(\.\d+)?$/.test(word)) return word;
    return TOKEN_LABELS[w] ?? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  let line = words.join(" ");
  line = line.replace(/\bDaily commute\b/i, "Daily commute");
  line = line.replace(/\bWeekend highway trips\b/i, "Weekend highway trips");
  return line;
}

export function formatAnswerDisplay(selectedIds: string[], step?: AdvisorStep): string {
  if (!selectedIds.length) return "—";
  const byId = new Map((step?.options ?? []).map((o) => [o.id, o.label.trim()]));
  const labels = selectedIds.map((id) => byId.get(id) ?? humanizeOptionId(id));
  return labels.join(" · ");
}

export function entryDisplayLine(entry: AdvisorAnswerEntry, step?: AdvisorStep): string {
  const ids = entry.selected_option_ids;
  if (!ids.length) return "—";
  if (
    entry.display_labels &&
    entry.display_labels.length === ids.length &&
    entry.display_labels.every((s) => s.trim().length > 0)
  ) {
    return entry.display_labels.map((s) => s.trim()).join(" · ");
  }
  return formatAnswerDisplay(ids, step);
}

/** Ordered labels for each selected option (for chips / comma lists). */
export function labelsForAnswerEntry(entry: AdvisorAnswerEntry, step?: AdvisorStep): string[] {
  const ids = entry.selected_option_ids;
  if (!ids.length) return [];
  if (
    entry.display_labels &&
    entry.display_labels.length === ids.length &&
    entry.display_labels.every((s) => s.trim().length > 0)
  ) {
    return entry.display_labels.map((s) => s.trim());
  }
  const byId = new Map((step?.options ?? []).map((o) => [o.id, o.label.trim()]));
  return ids.map((id) => byId.get(id) ?? humanizeOptionId(id));
}

/** Map a wizard step id to the rolling prompt snapshot slot, if any. */
export function stepToPromptKey(stepId: string): keyof PromptSnapshot | null {
  if (stepId === "city") return "city";
  if (stepId === "budget") return "budget";
  if (stepId === "body" || stepId === "body_type") return "body";
  if (stepId === "fuel" || stepId === "fuel_type") return "fuel";
  return null;
}

/** Rebuild promptSnapshot from a complete answer history (used on bootstrap). */
export function snapshotFromHistory(history: AdvisorAnswerEntry[]): PromptSnapshot {
  const snap: PromptSnapshot = { city: "", body: "", fuel: "", budget: "" };
  for (const a of history) {
    const key = stepToPromptKey(a.step_id);
    if (!key) continue;
    const label = a.display_labels?.[0]?.trim() || a.selected_option_ids?.[0] || "";
    if (label) snap[key] = label;
  }
  return snap;
}

/**
 * Best-effort ordering of step ids: answered steps in answer order, then any
 * known steps we haven't asked yet (from stepMap), then the current step last.
 */
export function getOrderedStepIds(
  answerHistory: AdvisorAnswerEntry[],
  currentStep: AdvisorStep | null,
  stepMap: Record<string, AdvisorStep>,
): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  for (const a of answerHistory) {
    if (seen.has(a.step_id)) continue;
    seen.add(a.step_id);
    order.push(a.step_id);
  }
  const allKnown = Object.values(stepMap).sort((a, b) => a.order - b.order);
  for (const s of allKnown) {
    if (seen.has(s.step_id)) continue;
    seen.add(s.step_id);
    order.push(s.step_id);
  }
  if (currentStep && !seen.has(currentStep.step_id)) {
    order.push(currentStep.step_id);
  }
  return order;
}

export function getCurrentStepPosition(
  orderedStepIds: string[],
  currentStepId: string | undefined,
): number {
  if (!currentStepId) return -1;
  return orderedStepIds.indexOf(currentStepId);
}
