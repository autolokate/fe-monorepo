import type {
  FlowContext,
  FlowDefinition,
  FlowTransition,
  GuardId,
  GuardResult,
  StepId,
} from '../../types/flow.js';

/**
 * Flow engine contract — implementation deferred until screen phase.
 * Orchestrates step progression, guard evaluation, and shared-step reuse.
 */
export type FlowEngine = {
  /** Resolve the active flow definition */
  getFlow(): FlowDefinition;

  /** Current runtime context */
  getContext(): FlowContext;

  /** Evaluate all guards for a target step */
  evaluateGuards(stepId: StepId, guardIds: readonly GuardId[]): GuardResult;

  /** Compute next step respecting shared-step deduplication */
  resolveNext(currentStepId: StepId): StepId | null;

  /** Compute previous step */
  resolvePrevious(currentStepId: StepId): StepId | null;

  /** Record a transition for analytics */
  recordTransition(transition: FlowTransition): void;
};

export type FlowEngineConfig = {
  flow: FlowDefinition;
  initialContext?: Partial<FlowContext>;
};

export type FlowEngineFactory = (config: FlowEngineConfig) => FlowEngine;
