import type { AnyFlowId, FlowDefinition } from '../../types/flow.js';

import { flowsConfig } from './config/flows.config.js';
import { stepsConfig } from './config/steps.config.js';
import type { FlowConfigEntry } from './config/types.js';

function assertStepsExist(stepIds: readonly string[]): void {
  for (const stepId of stepIds) {
    if (!(stepId in stepsConfig)) {
      throw new Error(`Flow config references unknown step: ${stepId}`);
    }
  }
}

function toFlowDefinition(entry: FlowConfigEntry): FlowDefinition {
  assertStepsExist(entry.stepIds);
  return {
    id: entry.id as AnyFlowId,
    productArea: entry.productArea,
    label: entry.label,
    steps: entry.stepIds,
    ...(entry.entryGuardIds ? { entryGuardIds: entry.entryGuardIds } : {}),
  };
}

/** Build typed flow registry from declarative config. */
export function buildFlowRegistry(config: readonly FlowConfigEntry[]): Record<string, FlowDefinition> {
  return Object.fromEntries(config.map((entry) => [entry.id, toFlowDefinition(entry)]));
}

export const flowRegistry = buildFlowRegistry(flowsConfig);

export type FlowRegistry = typeof flowRegistry;
export type RegisteredFlowId = keyof FlowRegistry;
