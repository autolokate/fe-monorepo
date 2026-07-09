import { flowLabels } from '../../journey/constants.js';
import type { ActivationFlowId } from '../../journey/types.js';

import type { FlowEntryDefinition, PlatformFlowId } from './types.js';

/** Canonical registry of all Autolokate PWA entry flows. */
export const FLOW_ENTRY_REGISTRY: readonly FlowEntryDefinition[] = [
  {
    id: 'purchase',
    label: flowLabels.purchase,
    kind: 'activation',
  },
  {
    id: 'prepaid',
    label: flowLabels.prepaid,
    kind: 'activation',
  },
  {
    id: 'b2b2c',
    label: flowLabels.b2b2c,
    kind: 'activation',
  },
  {
    id: 'postActivation',
    label: 'QR Scan (Post-Activation)',
    description: 'Already activated vehicle',
    kind: 'scanner',
  },
] as const;

export const ACTIVATION_FLOW_ENTRIES = FLOW_ENTRY_REGISTRY.filter(
  (entry): entry is FlowEntryDefinition & { id: ActivationFlowId } => entry.kind === 'activation',
);

const postActivationEntry = FLOW_ENTRY_REGISTRY.find((entry) => entry.id === 'postActivation');
if (!postActivationEntry) {
  throw new Error('postActivation entry missing from FLOW_ENTRY_REGISTRY');
}
export const POST_ACTIVATION_FLOW_ENTRY = postActivationEntry;

export function getFlowEntryById(id: PlatformFlowId): FlowEntryDefinition | undefined {
  return FLOW_ENTRY_REGISTRY.find((entry) => entry.id === id);
}

export function isActivationFlowId(id: PlatformFlowId): id is ActivationFlowId {
  return id !== 'postActivation';
}
