export const PREPAID_FLOW_STEP_COUNT = 3;

/** Prepaid-phase view states (presentational only). */
export type PrepaidScreenState = 'default' | 'loading' | 'error' | 'success';

export type PrepaidStepId =
  | 'prepaid.entry'
  | 'prepaid.activation-code'
  | 'prepaid.code-validation';

export type PrepaidScreenId = 'PrepaidEntry' | 'ActivationCode' | 'CodeValidation';

export type PrepaidScreenInventoryEntry = {
  id: PrepaidScreenId;
  stepId: PrepaidStepId;
  featureFolder: string;
  figmaRef: string;
  description: string;
};
