export type { FeatureDefinition } from '../registry.js';
export { featureRegistry } from '../registry.js';
export type {
  PurchaseScreenId,
  PurchaseScreenInventoryEntry,
  PurchaseScreenState,
  PurchaseStepId,
} from './types.js';
export { PURCHASE_FLOW_STEP_COUNT } from './types.js';
export * from './screens/index.js';

export const featureId = 'qr-purchase' as const;
