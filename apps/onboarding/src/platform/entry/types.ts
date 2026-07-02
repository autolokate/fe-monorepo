import type { ActivationFlowId } from '../../journey/types.js';

/** All platform entry flows — activation journeys + post-activation scanner. */
export type PlatformFlowId = ActivationFlowId | 'postActivation';

/** Where a dispatch request originated. */
export type FlowDispatchSource = 'qrPayload';

export type FlowEntryKind = 'activation' | 'scanner';

export type FlowEntryDefinition = {
  id: PlatformFlowId;
  label: string;
  description?: string;
  kind: FlowEntryKind;
};
