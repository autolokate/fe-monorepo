import type { GuardId, ProductAreaId, StepId } from '@/types/flow.js';

/** Config shape for a registered flow — registry is built from this at compile time. */
export type FlowConfigEntry = {
  id: string;
  productArea: ProductAreaId;
  label: string;
  stepIds: readonly StepId[];
  entryGuardIds?: readonly GuardId[];
};

export type FlowConfig = readonly FlowConfigEntry[];
