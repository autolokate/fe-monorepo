export type { FeatureDefinition } from '../registry';
export { featureRegistry } from '../registry';
export type {
  PurchaseScreenId,
  PurchaseScreenInventoryEntry,
  PurchaseScreenState,
  PurchaseStepId,
} from './types';
export { PURCHASE_FLOW_STEP_COUNT } from './types';
export * from './screens/index';

export const featureId = 'qr-purchase' as const;
