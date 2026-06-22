"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdvisorMatches } from "@/hooks/advisor/useAdvisorMatches";
import { cn } from "@/lib/utils";
import { PreferenceSummaryChips } from "../PreferenceSummaryChips";
import { AiMatchedCarCard } from "../AiMatchedCarCard";
import { PAGE_SIZE, sortMatches } from "./constants";

/**
 * AI-matched results section — only renders once the wizard reports `completed`
 * AND the advisor returned at least one model match. Otherwise renders nothing
 * so the home page collapses cleanly for first-time visitors.
 */
export function AiMatchedResults() {
  const { matches, meta, completed, preferenceSummaryRows } = useAdvisorMatches();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sorted = useMemo(() => sortMatches(matches, "match"), [matches]);
  const shown = sorted.slice(0, visible);
  const remaining = Math.max(0, sorted.length - visible);

  if (!completed || matches.length === 0) return null;

  return (
    <section
      id="ai-matched-results"
      aria-labelledby="ai-matched-heading"
      className="relative border-y border-border/70 bg-background py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <header className="mb-8 sm:mb-10">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI-matched
            </span>
            <h2
              id="ai-matched-heading"
              className="font-display mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              Cars matched to your preferences
            </h2>
            {meta.aiSummary ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
                {meta.aiSummary}
              </p>
            ) : (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
                Ranked by how well each car fits the answers you gave the preference
                finder.{" "}
                {meta.totalMatches != null && (
                  <span className="font-medium text-foreground">
                    {meta.totalMatches} total match{meta.totalMatches === 1 ? "" : "es"}
                  </span>
                )}
              </p>
            )}
          </div>
        </header>

        {preferenceSummaryRows.length > 0 && (
          <div
            className="mb-6 rounded-xl border border-border/70 bg-card/50 px-3 py-2.5 sm:mb-8 sm:px-4 sm:py-3"
            aria-labelledby="ai-matched-preferences-heading"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p
                id="ai-matched-preferences-heading"
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Your preferences
              </p>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 text-xs font-semibold" asChild>
                <Link href="/#preference-finder-stepper">
                  <Pencil className="h-3.5 w-3.5 opacity-80" aria-hidden />
                  Edit preferences
                </Link>
              </Button>
            </div>
            <PreferenceSummaryChips rows={preferenceSummaryRows} className="mt-2" />
          </div>
        )}

        <ul
          className={cn(
            "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
            "auto-rows-fr",
          )}
        >
          {shown.map((row) => (
            <li key={row.id} className="min-h-0">
              <AiMatchedCarCard row={row} />
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-card/90"
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
              Show {Math.min(remaining, PAGE_SIZE)} more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
