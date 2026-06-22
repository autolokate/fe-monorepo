"use client";

import { useMemo } from "react";
import { buildPreferenceSummaryRows } from "@/lib/advisor/preference-summary";
import { normalizeAdvisorResultsToMatches, advisorResultsMeta } from "@/lib/advisor/normalize";
import { usePreferenceFinder } from "./usePreferenceFinder";

/**
 * Derived selector: normalised match-cards + meta (total + AI summary).
 * Read this in the AI-matched results section instead of touching the raw
 * `advisorResults` payload directly.
 */
export function useAdvisorMatches() {
  const { advisorResults, completed, answerHistory, stepMap } = usePreferenceFinder();
  return useMemo(() => {
    const matches = normalizeAdvisorResultsToMatches(advisorResults);
    const meta = advisorResultsMeta(advisorResults);
    const preferenceSummaryRows = completed
      ? buildPreferenceSummaryRows(true, answerHistory, stepMap, advisorResults)
      : [];
    return { matches, meta, completed, preferenceSummaryRows };
  }, [advisorResults, completed, answerHistory, stepMap]);
}
