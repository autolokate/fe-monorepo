"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  archiveAdvisorConversation,
  createAdvisorConversation,
  getAdvisorConversation,
  getAdvisorCurrentStep,
  getAdvisorResults,
  listAdvisorConversations,
  submitAdvisorAnswer,
} from "@/services/advisor";
import type {
  AdvisorAnswerEntry,
  AdvisorStep,
  PromptSnapshot,
} from "@/lib/advisor/types";
import {
  humanizeOptionId,
  snapshotFromHistory,
  stepToPromptKey,
} from "@/lib/advisor/step-utils";
import { useIsAuthenticated } from "@/hooks/auth/useIsAuthenticated";

/**
 * Shape of the preference-finder context. State + actions are flattened into
 * one object — components only read the fields they need.
 */
export interface PreferenceFinderContextValue {
  // ── state ──
  conversationId: string | null;
  currentStep: AdvisorStep | null;
  completed: boolean;
  recentlyRestartedSession: boolean;
  ready: boolean;
  bootstrapping: boolean;
  submitting: boolean;
  error: string | null;
  answerHistory: AdvisorAnswerEntry[];
  stepMap: Record<string, AdvisorStep>;
  cityInput: string;
  multiDraft: string[];
  advisorResults: unknown | null;
  promptSnapshot: PromptSnapshot;
  pendingCompletionCelebration: boolean;
  loggedIn: boolean;

  // ── actions ──
  bootstrap: () => Promise<void>;
  resetJourney: () => Promise<void>;
  selectSingleOption: (optionId: string, optionLabel: string) => Promise<void>;
  confirmMultiSelect: (labelsById: Record<string, string>) => Promise<void>;
  toggleMultiDraft: (id: string) => void;
  setMultiDraft: (ids: string[]) => void;
  setCityInput: (value: string) => void;
  jumpToStep: (stepId: string) => Promise<void>;
  clearError: () => void;
  acknowledgeCompletionCelebration: () => void;
}

const EMPTY_SNAPSHOT: PromptSnapshot = { city: "", body: "", fuel: "", budget: "" };

const Ctx = React.createContext<PreferenceFinderContextValue | null>(null);

/** Initial state shape — also reused when the user logs out / restarts. */
const initialState = {
  conversationId: null as string | null,
  currentStep: null as AdvisorStep | null,
  completed: false,
  recentlyRestartedSession: false,
  ready: false,
  bootstrapping: false,
  submitting: false,
  error: null as string | null,
  answerHistory: [] as AdvisorAnswerEntry[],
  stepMap: {} as Record<string, AdvisorStep>,
  cityInput: "",
  multiDraft: [] as string[],
  advisorResults: null as unknown,
  promptSnapshot: EMPTY_SNAPSHOT,
  pendingCompletionCelebration: false,
};

type State = typeof initialState;

export function PreferenceFinderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(initialState);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const authed = useIsAuthenticated();
  const loggedIn = authed === true;

  // ── tiny patch helper so we don't re-derive whole objects everywhere ──
  const patch = React.useCallback((next: Partial<State>) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);

  // ── primitive setters ──
  const setCityInput = React.useCallback(
    (value: string) => patch({ cityInput: value }),
    [patch],
  );
  const setMultiDraft = React.useCallback(
    (ids: string[]) => patch({ multiDraft: ids }),
    [patch],
  );
  const toggleMultiDraft = React.useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        multiDraft: prev.multiDraft.includes(id)
          ? prev.multiDraft.filter((x) => x !== id)
          : [...prev.multiDraft, id],
      }));
    },
    [],
  );
  const clearError = React.useCallback(() => patch({ error: null }), [patch]);
  const acknowledgeCompletionCelebration = React.useCallback(
    () => patch({ pendingCompletionCelebration: false }),
    [patch],
  );

  // ── bootstrap: pick the latest conversation (or create one) and fetch state ──
  const bootstrap = React.useCallback(async () => {
    patch({ bootstrapping: true, error: null, ready: false });
    try {
      const conversations = await listAdvisorConversations(20);
      let selectedId = conversations[0]?.id ?? null;
      let initialStep: AdvisorStep | null = null;

      if (!selectedId) {
        const created = await createAdvisorConversation({
          vehicle_category: "car",
          title: "Preference finder",
        });
        selectedId = created.id;
        initialStep = created.next_step ?? null;
      }

      if (!selectedId) {
        patch({
          error: "Unable to start your questionnaire.",
          ready: true,
          bootstrapping: false,
        });
        return;
      }

      const detail = await getAdvisorConversation(selectedId, 20);
      const detailAnswers = detail?.answers ?? [];

      if (initialStep) {
        setState((prev) => ({
          ...prev,
          conversationId: selectedId,
          answerHistory: detailAnswers,
          currentStep: initialStep,
          stepMap: { ...prev.stepMap, [initialStep!.step_id]: initialStep! },
          completed: false,
          pendingCompletionCelebration: false,
          multiDraft: initialStep!.multi_select ? [] : [],
          promptSnapshot: snapshotFromHistory(detailAnswers),
          ready: true,
          bootstrapping: false,
        }));
        return;
      }

      const cur = await getAdvisorCurrentStep(selectedId);
      const step = cur?.step ?? null;
      const isCompleted = Boolean(cur?.completed);
      const advisorResults = isCompleted ? await getAdvisorResults(selectedId) : null;
      const finalHistory = cur?.answers ?? detailAnswers;

      setState((prev) => ({
        ...prev,
        conversationId: selectedId,
        answerHistory: finalHistory,
        promptSnapshot: snapshotFromHistory(finalHistory),
        completed: isCompleted,
        pendingCompletionCelebration: false,
        ready: true,
        bootstrapping: false,
        ...(step
          ? {
              currentStep: step,
              stepMap: { ...prev.stepMap, [step.step_id]: step },
              multiDraft: step.multi_select ? [] : [],
            }
          : null),
        ...(isCompleted ? { advisorResults, currentStep: null } : null),
      }));
    } catch {
      patch({
        error: "We could not load your questionnaire. Try again.",
        ready: true,
        bootstrapping: false,
      });
    }
  }, [patch]);

  // ── reset: archive previous thread and start fresh ──
  const resetJourney = React.useCallback(async () => {
    const previousConversationId = stateRef.current.conversationId;
    setState(() => ({
      ...initialState,
      bootstrapping: true,
    }));
    try {
      if (previousConversationId) {
        await archiveAdvisorConversation(previousConversationId).catch(() => {});
      }
      const created = await createAdvisorConversation({
        vehicle_category: "car",
        title: "Preference finder",
      });
      const selectedId = created.id;
      const initialStep = created.next_step ?? null;
      if (!selectedId) {
        patch({
          error: "Unable to start a new session.",
          bootstrapping: false,
          ready: true,
        });
        return;
      }
      const detail = await getAdvisorConversation(selectedId, 20);
      const detailAnswers = detail?.answers ?? [];

      if (initialStep) {
        setState(() => ({
          ...initialState,
          conversationId: selectedId,
          answerHistory: detailAnswers,
          currentStep: initialStep,
          stepMap: { [initialStep.step_id]: initialStep },
          completed: false,
          pendingCompletionCelebration: false,
          multiDraft: initialStep.multi_select ? [] : [],
          promptSnapshot: snapshotFromHistory(detailAnswers),
          ready: true,
          bootstrapping: false,
          recentlyRestartedSession: true,
        }));
        return;
      }

      const cur = await getAdvisorCurrentStep(selectedId);
      const step = cur?.step ?? null;
      const isCompleted = Boolean(cur?.completed);
      const advisorResults = isCompleted ? await getAdvisorResults(selectedId) : null;
      const finalHistory = cur?.answers ?? detailAnswers;

      setState(() => ({
        ...initialState,
        conversationId: selectedId,
        answerHistory: finalHistory,
        promptSnapshot: snapshotFromHistory(finalHistory),
        completed: isCompleted,
        pendingCompletionCelebration: false,
        ready: true,
        bootstrapping: false,
        recentlyRestartedSession: !isCompleted,
        ...(step
          ? {
              currentStep: step,
              stepMap: { [step.step_id]: step },
              multiDraft: step.multi_select ? [] : [],
            }
          : null),
        ...(isCompleted ? { advisorResults, currentStep: null } : null),
      }));
    } catch {
      patch({
        error: "Could not restart your journey.",
        bootstrapping: false,
        ready: true,
      });
    }
  }, [patch]);

  // ── submit a single-select answer ──
  const selectSingleOption = React.useCallback(
    async (optionId: string, optionLabel: string) => {
      const s = stateRef.current;
      const { conversationId, currentStep, submitting } = s;
      if (!conversationId || !currentStep || submitting) return;
      if (currentStep.multi_select) return;

      patch({ submitting: true, error: null });
      try {
        const key = stepToPromptKey(currentStep.step_id);
        setState((prev) => ({
          ...prev,
          promptSnapshot: key
            ? { ...prev.promptSnapshot, [key]: optionLabel }
            : prev.promptSnapshot,
          answerHistory: [
            ...prev.answerHistory.filter((a) => a.step_id !== currentStep.step_id),
            {
              step_id: currentStep.step_id,
              selected_option_ids: [optionId],
              display_labels: [optionLabel.trim() || humanizeOptionId(optionId)],
            },
          ],
          stepMap: { ...prev.stepMap, [currentStep.step_id]: currentStep },
        }));

        const res = await submitAdvisorAnswer(conversationId, {
          step_id: currentStep.step_id,
          selected_option_ids: [optionId],
        });

        if (res?.completed) {
          const results = await getAdvisorResults(conversationId);
          patch({
            completed: true,
            currentStep: null,
            multiDraft: [],
            advisorResults: results,
            pendingCompletionCelebration: true,
            recentlyRestartedSession: false,
          });
        } else if (res?.next_step) {
          const next = res.next_step;
          setState((prev) => ({
            ...prev,
            currentStep: next,
            stepMap: { ...prev.stepMap, [next.step_id]: next },
            multiDraft: next.multi_select ? [] : prev.multiDraft,
            recentlyRestartedSession: false,
          }));
        }
      } catch {
        patch({ error: "Could not save your answer. Please try again." });
        toast.error("Could not save your answer.");
      } finally {
        patch({ submitting: false });
      }
    },
    [patch],
  );

  // ── submit a multi-select answer ──
  const confirmMultiSelect = React.useCallback(
    async (labelsById: Record<string, string>) => {
      const s = stateRef.current;
      const { conversationId, currentStep, submitting, multiDraft } = s;
      if (!conversationId || !currentStep || submitting || !currentStep.multi_select) return;
      if (multiDraft.length === 0) {
        toast.message("Select at least one option.");
        return;
      }

      patch({ submitting: true, error: null });
      try {
        const labelJoined = multiDraft.map((id) => labelsById[id] ?? id).join(", ");
        const key = stepToPromptKey(currentStep.step_id);
        setState((prev) => ({
          ...prev,
          promptSnapshot: key
            ? { ...prev.promptSnapshot, [key]: labelJoined }
            : prev.promptSnapshot,
          answerHistory: [
            ...prev.answerHistory.filter((a) => a.step_id !== currentStep.step_id),
            {
              step_id: currentStep.step_id,
              selected_option_ids: multiDraft,
              display_labels: multiDraft.map((id) =>
                labelsById[id]?.trim() ? labelsById[id].trim() : humanizeOptionId(id),
              ),
            },
          ],
          stepMap: { ...prev.stepMap, [currentStep.step_id]: currentStep },
        }));

        const res = await submitAdvisorAnswer(conversationId, {
          step_id: currentStep.step_id,
          selected_option_ids: multiDraft,
        });

        if (res?.completed) {
          const results = await getAdvisorResults(conversationId);
          patch({
            completed: true,
            currentStep: null,
            multiDraft: [],
            advisorResults: results,
            pendingCompletionCelebration: true,
            recentlyRestartedSession: false,
          });
        } else if (res?.next_step) {
          const next = res.next_step;
          setState((prev) => ({
            ...prev,
            currentStep: next,
            stepMap: { ...prev.stepMap, [next.step_id]: next },
            multiDraft: next.multi_select ? [] : [],
            recentlyRestartedSession: false,
          }));
        }
      } catch {
        patch({ error: "Could not save your selections." });
        toast.error("Could not save your selections.");
      } finally {
        patch({ submitting: false });
      }
    },
    [patch],
  );

  // ── jump back to a previously-answered (or known upcoming) step ──
  const jumpToStep = React.useCallback(
    async (stepId: string) => {
      const s = stateRef.current;
      const known = s.stepMap[stepId];
      if (known) {
        const prev = s.answerHistory.find((a) => a.step_id === stepId);
        const restoredMulti =
          known.multi_select && prev?.selected_option_ids?.length
            ? [...prev.selected_option_ids]
            : known.multi_select
              ? []
              : [];
        patch({
          currentStep: known,
          completed: false,
          pendingCompletionCelebration: false,
          multiDraft: restoredMulti,
          error: null,
        });
        return;
      }
      if (!s.conversationId) return;
      try {
        const cur = await getAdvisorCurrentStep(s.conversationId);
        if (cur?.step) {
          setState((prev) => ({
            ...prev,
            currentStep: cur.step!,
            completed: false,
            pendingCompletionCelebration: false,
            stepMap: { ...prev.stepMap, [cur.step!.step_id]: cur.step! },
          }));
          toast.info(
            s.completed
              ? "Editing will start from the current step in this session."
              : "Opened the latest step from the server.",
          );
        }
      } catch {
        toast.error("Unable to open this step right now.");
      }
    },
    [patch],
  );

  // ── Bootstrap when the user logs in; reset to empty when they log out. ──
  React.useEffect(() => {
    if (!loggedIn) {
      setState(initialState);
      return;
    }
    void bootstrap();
  }, [loggedIn, bootstrap]);

  const value: PreferenceFinderContextValue = {
    ...state,
    loggedIn,
    bootstrap,
    resetJourney,
    selectSingleOption,
    confirmMultiSelect,
    toggleMultiDraft,
    setMultiDraft,
    setCityInput,
    jumpToStep,
    clearError,
    acknowledgeCompletionCelebration,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Read the preference-finder context. Throws if used outside the provider. */
export function usePreferenceFinder(): PreferenceFinderContextValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error("usePreferenceFinder must be used inside <PreferenceFinderProvider>.");
  }
  return ctx;
}
