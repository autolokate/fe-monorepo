"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  Loader2,
  LogIn,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferenceFinder } from "@/hooks/advisor/usePreferenceFinder";
import {
  getCurrentStepPosition,
  getOrderedStepIds,
  humanizeOptionId,
} from "@/lib/advisor/step-utils";
import { buildPreferenceSummaryRows, type PreferenceSummaryRow } from "@/lib/advisor/preference-summary";
import type { AdvisorStep } from "@/lib/advisor/types";
import { cn } from "@/lib/utils";
import { PreferenceSummaryFields } from "../PreferenceSummaryFields";
import { QUICK_PICK_CITIES, WIZARD_COPY } from "./constants";

/* ────────────────────────────────────────────────────────────────────────────
 * Logged-out card — invites a non-authed visitor to log in before the wizard
 * is even hydrated. Replaces the framer-motion + Radix logged-out card.
 * ──────────────────────────────────────────────────────────────────────── */
function LoggedOutCard() {
  return (
    <article className="relative w-full overflow-hidden rounded-2xl border border-border/90 bg-card shadow-[0_1px_0_rgba(15,23,42,0.05),0_12px_32px_-20px_rgba(15,23,42,0.18)]">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-zinc-500/[0.08] blur-2xl"
        aria-hidden
      />
      <header className="relative border-b border-border/70 bg-linear-to-b from-muted/50 to-card px-5 pb-4 pt-5 sm:px-6 sm:pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {WIZARD_COPY.loggedOutEyebrow}
          </span>
          <span className="rounded-md border border-border/80 bg-background/90 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
            4 · ~2 min
          </span>
        </div>
        <div className="mt-2.5 h-0.5 w-11 rounded-full bg-foreground/80" aria-hidden />
        <h3 className="font-display mt-3 text-balance text-xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-[1.35rem]">
          {WIZARD_COPY.loggedOutTitle}
        </h3>
        <p className="mt-2.5 text-[13px] leading-snug text-muted-foreground sm:text-sm">
          {WIZARD_COPY.loggedOutDescription}
        </p>
      </header>

      <div className="px-5 py-4 sm:px-6">
        <ul className="grid gap-2">
          {WIZARD_COPY.loggedOutBullets.map((row) => (
            <li
              key={row.title}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm"
                aria-hidden
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-[13px] font-semibold text-foreground sm:text-sm">
                  {row.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-[13px]">
                  {row.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <footer className="border-t border-border/70 bg-muted/15 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3" asChild>
              <Link href={WIZARD_COPY.loggedOutCtaSecondary.href}>
                <Building2 className="h-3.5 w-3.5 opacity-80" aria-hidden />
                {WIZARD_COPY.loggedOutCtaSecondary.label}
              </Link>
            </Button>
            <Button size="sm" className="h-8 gap-1.5 px-3.5" asChild>
              <Link href={WIZARD_COPY.loggedOutCtaPrimary.href}>
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                {WIZARD_COPY.loggedOutCtaPrimary.label}
              </Link>
            </Button>
          </div>
          <Link
            href="/how-qr-works"
            className="shrink-0 text-center text-[11px] font-medium text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline sm:text-left"
          >
            All listings
          </Link>
        </div>
        <p className="mt-3 text-center text-[10px] leading-snug text-muted-foreground/90 sm:text-left">
          OTP to your phone · no password stored
        </p>
      </footer>
    </article>
  );
}

const OPTION_SKELETON_PLACEHOLDERS = 6;

/* ────────────────────────────────────────────────────────────────────────────
 * Bootstrap loading — mirrors progress strip, question, option grid, footer
 * ──────────────────────────────────────────────────────────────────────── */
function PreferenceFinderLoadingSkeleton() {
  return (
    <div
      className="flex min-h-[min(20rem,60vh)] flex-col"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{WIZARD_COPY.loadingLabel}</span>

      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-32 rounded-md" />
          <Skeleton className="h-3 w-9 rounded-md" />
        </div>
        <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
        <Skeleton className="mt-4 h-6 w-[min(100%,24rem)] max-w-full rounded-lg sm:h-7" />
      </div>

      <div className="flex-1 px-5 py-5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {Array.from({ length: OPTION_SKELETON_PLACEHOLDERS }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/30 px-3.5 py-3"
            >
              <Skeleton className="h-4 flex-1 rounded-md sm:max-w-[75%]" />
              <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-border/60 px-5 py-3.5">
        <Skeleton className="h-8 w-[4.5rem] rounded-full" />
        <Skeleton className="h-8 w-[5.25rem] rounded-full" />
      </footer>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Progress strip
 * ──────────────────────────────────────────────────────────────────────── */
function ProgressBar({
  current,
  total,
  percent,
  question,
}: {
  current: number;
  total: number;
  percent: number;
  question: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-semibold uppercase tracking-[0.12em]">
          Step {current} of {total}
        </span>
        <span className="tabular-nums">{clamped}%</span>
      </div>
      <Progress value={clamped} className="mt-2 h-1.5" aria-label="Questionnaire progress" />
      <h4 className="font-display mt-4 text-balance text-base font-semibold tracking-tight text-foreground sm:text-lg">
        {question}
      </h4>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Option grid (single-select) — used for body / fuel / budget etc.
 * ──────────────────────────────────────────────────────────────────────── */
function OptionGrid({
  step,
  pending,
  onPick,
  disabled,
}: {
  step: AdvisorStep;
  pending: string | null;
  onPick: (id: string, label: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {step.options.map((op) => {
        const selected = pending === op.id;
        return (
          <button
            key={op.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(op.id, op.label)}
            className={cn(
              "group flex items-center justify-between gap-3 rounded-xl border bg-card px-3.5 py-3 text-left transition",
              "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              selected
                ? "border-primary/55 bg-primary/[0.08] ring-1 ring-primary/15"
                : "border-border/70",
              disabled && "cursor-wait opacity-60",
            )}
            aria-pressed={selected}
          >
            <span className="text-sm font-medium text-foreground">{op.label}</span>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-primary transition",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/80 bg-background",
              )}
              aria-hidden
            >
              <Check className={cn("h-3 w-3", !selected && "opacity-0")} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Chip grid (multi-select)
 * ──────────────────────────────────────────────────────────────────────── */
function MultiChips({
  step,
  selectedIds,
  onToggle,
  disabled,
}: {
  step: AdvisorStep;
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {step.options.map((op) => {
        const active = selectedIds.includes(op.id);
        return (
          <button
            key={op.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(op.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "border-primary/60 bg-primary/[0.12] text-primary"
                : "border-border/70 bg-card text-foreground hover:border-primary/35",
              disabled && "cursor-wait opacity-60",
            )}
            aria-pressed={active}
          >
            {active && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
            {op.label}
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * City step — free-text input + quick-pick chips
 * ──────────────────────────────────────────────────────────────────────── */
function CityField({
  value,
  onChange,
  onPick,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (city: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Your city
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type a city (e.g. Bengaluru)"
        className={cn(
          "mt-2 w-full rounded-xl border border-border/70 bg-card px-4 py-2.5 text-sm text-foreground shadow-sm",
          "placeholder:text-muted-foreground focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/15",
        )}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_PICK_CITIES.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onPick(c)}
            className={cn(
              "rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-foreground transition",
              "hover:border-primary/40 hover:bg-primary/[0.06]",
              disabled && "cursor-wait opacity-60",
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Summary — answers so far + restart / view-matches actions
 * ──────────────────────────────────────────────────────────────────────── */
function SummaryView({
  summaryRows,
  onStartOver,
  onViewMatches,
  resetting,
}: {
  summaryRows: PreferenceSummaryRow[];
  onStartOver: () => void;
  onViewMatches: () => void;
  resetting: boolean;
}) {
  return (
    <div id="preference-finder-summary">
      <h4 className="font-display text-base font-semibold tracking-tight text-foreground">
        {WIZARD_COPY.emptyStateTitle}
      </h4>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {WIZARD_COPY.emptyStateDescription}
      </p>
      <PreferenceSummaryFields
        rows={summaryRows}
        className="mt-4 grid gap-2 sm:grid-cols-2"
        mustHavesSpanClassName="sm:col-span-2"
      />
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onViewMatches}>
          <Eye className="h-3.5 w-3.5" aria-hidden />
          {WIZARD_COPY.viewMatchesLabel}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onStartOver}
          disabled={resetting}
        >
          {resetting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          )}
          {WIZARD_COPY.startOverLabel}
        </Button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Main component
 * ──────────────────────────────────────────────────────────────────────── */
export function PreferenceFinderWizard() {
  const pf = usePreferenceFinder();
  const {
    loggedIn,
    ready,
    bootstrapping,
    error,
    submitting,
    currentStep,
    completed,
    answerHistory,
    stepMap,
    cityInput,
    multiDraft,
    setCityInput,
    toggleMultiDraft,
    selectSingleOption,
    confirmMultiSelect,
    jumpToStep,
    resetJourney,
    bootstrap,
    clearError,
    advisorResults,
  } = pf;

  const [pendingSingle, setPendingSingle] = useState<{ id: string; label: string } | null>(
    null,
  );
  const [resetting, setResetting] = useState(false);

  const summaryRows = useMemo(
    () => buildPreferenceSummaryRows(completed, answerHistory, stepMap, advisorResults),
    [completed, answerHistory, stepMap, advisorResults],
  );

  // Reflect any previously-saved answer into pending state when the step
  // changes (so jumping back to "fuel" pre-selects the user's prior choice).
  useEffect(() => {
    if (!currentStep) {
      setPendingSingle(null);
      return;
    }
    if (currentStep.multi_select) {
      setPendingSingle(null);
      return;
    }
    const prev = answerHistory.find((a) => a.step_id === currentStep.step_id);
    if (currentStep.step_id === "city") {
      const city = (prev?.display_labels?.[0] ?? prev?.selected_option_ids?.[0] ?? "").trim();
      if (city) {
        setCityInput(city);
        setPendingSingle({ id: city, label: city });
      } else {
        setPendingSingle(null);
      }
      return;
    }
    if (prev?.selected_option_ids?.[0]) {
      const id = prev.selected_option_ids[0];
      const label = prev.display_labels?.[0]?.trim() || humanizeOptionId(id);
      setPendingSingle({ id, label });
    } else {
      setPendingSingle(null);
    }
  }, [currentStep, answerHistory, setCityInput]);

  const orderedStepIds = useMemo(
    () => getOrderedStepIds(answerHistory, currentStep, stepMap),
    [answerHistory, currentStep, stepMap],
  );
  const currentIndex = useMemo(
    () => getCurrentStepPosition(orderedStepIds, currentStep?.step_id),
    [orderedStepIds, currentStep?.step_id],
  );

  /**
   * `stepMap` only grows as steps load; early on `orderedStepIds.length` is often 1,
   * which wrongly produced “Step 1 of 1” and 100%. Use a minimum estimate and,
   * while still on the last *known* step and not completed, reserve headroom so
   * the bar never reads “done” before submit.
   */
  const progressTotal = useMemo(() => {
    if (completed) return Math.max(orderedStepIds.length, 1);
    const knownLen = orderedStepIds.length;
    const stepNum = currentIndex + 1;
    const base = Math.max(knownLen, WIZARD_COPY.estimatedWizardSteps);
    const onLastKnownStep =
      Boolean(currentStep) && knownLen > 0 && stepNum === knownLen;
    const denominator = onLastKnownStep ? Math.max(base, stepNum + 1) : base;
    return Math.max(denominator, stepNum, 1);
  }, [completed, orderedStepIds.length, currentIndex, currentStep]);

  const progressNumerator = completed ? progressTotal : currentIndex + 1;
  const progressPct = completed ? 100 : Math.round((progressNumerator / progressTotal) * 100);

  const canProceed = useMemo(() => {
    if (!currentStep) return false;
    if (currentStep.multi_select) return multiDraft.length > 0;
    if (currentStep.step_id === "city")
      return Boolean(cityInput.trim() || pendingSingle?.label);
    return Boolean(pendingSingle?.id);
  }, [currentStep, multiDraft.length, cityInput, pendingSingle]);

  const handleNext = useCallback(async () => {
    if (!currentStep || submitting) return;
    if (currentStep.multi_select) {
      const map = Object.fromEntries(currentStep.options.map((o) => [o.id, o.label]));
      await confirmMultiSelect(map);
      return;
    }
    if (currentStep.step_id === "city") {
      const c = cityInput.trim() || pendingSingle?.label?.trim() || "";
      if (!c) return;
      await selectSingleOption(c, c);
      setPendingSingle(null);
      return;
    }
    if (pendingSingle) {
      await selectSingleOption(pendingSingle.id, pendingSingle.label);
      setPendingSingle(null);
    }
  }, [
    currentStep,
    submitting,
    confirmMultiSelect,
    selectSingleOption,
    cityInput,
    pendingSingle,
  ]);

  const handleBack = useCallback(() => {
    if (currentIndex <= 0) return;
    const prevId = orderedStepIds[currentIndex - 1];
    if (prevId) void jumpToStep(prevId);
  }, [currentIndex, orderedStepIds, jumpToStep]);

  const handleStartOver = useCallback(async () => {
    setResetting(true);
    try {
      await resetJourney();
      setPendingSingle(null);
    } finally {
      setResetting(false);
    }
  }, [resetJourney]);

  // ── render ──
  if (!loggedIn) return <LoggedOutCard />;

  return (
    <article
      id="preference-finder-stepper"
      role="region"
      aria-label="Car preference questionnaire"
      className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <header className="border-b border-border/70 bg-muted/30 px-5 py-3.5">
        {bootstrapping || !ready ? (
          <div className="flex items-center gap-1.5" aria-hidden>
            <Skeleton className="size-3.5 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-36 max-w-[70%] rounded-md" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-xs font-semibold tracking-wide text-foreground">
              {WIZARD_COPY.smartFinderTitle}
            </span>
          </div>
        )}
      </header>

      <div className="flex min-h-[min(20rem,60vh)] flex-col">
        {bootstrapping || !ready ? (
          <PreferenceFinderLoadingSkeleton />
        ) : error ? (
          <div className="flex flex-1 flex-col justify-center px-5 py-8">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-fit"
              onClick={() => {
                clearError();
                void bootstrap();
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              {WIZARD_COPY.retryLabel}
            </Button>
          </div>
        ) : currentStep && !completed ? (
          <>
            <div className="border-b border-border/60 px-5 py-4">
              <ProgressBar
                current={Math.max(1, currentIndex + 1)}
                total={progressTotal}
                percent={progressPct}
                question={currentStep.question}
              />
            </div>
            <div className="flex-1 px-5 py-5">
              {currentStep.step_id === "city" ? (
                <CityField
                  value={cityInput}
                  onChange={setCityInput}
                  onPick={(c) => {
                    setCityInput(c);
                    setPendingSingle({ id: c, label: c });
                  }}
                  disabled={submitting}
                />
              ) : currentStep.multi_select ? (
                <MultiChips
                  step={currentStep}
                  selectedIds={multiDraft}
                  onToggle={toggleMultiDraft}
                  disabled={submitting}
                />
              ) : (
                <OptionGrid
                  step={currentStep}
                  pending={pendingSingle?.id ?? null}
                  onPick={(id, label) => setPendingSingle({ id, label })}
                  disabled={submitting}
                />
              )}
            </div>
            <footer className="flex items-center justify-between border-t border-border/60 px-5 py-3.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={currentIndex <= 0 || submitting}
                className="gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleNext()}
                disabled={!canProceed || submitting}
                className="gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : currentStep.multi_select ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                )}
                {currentStep.multi_select ? "Save & continue" : "Next"}
              </Button>
            </footer>
          </>
        ) : (
          <div className="flex-1 px-5 py-5">
            <SummaryView
              summaryRows={summaryRows}
              onStartOver={handleStartOver}
              onViewMatches={() => {
                document
                  .getElementById("ai-matched-results")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              resetting={resetting}
            />
          </div>
        )}
      </div>
    </article>
  );
}
