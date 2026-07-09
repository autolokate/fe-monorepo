export * from './app/index.js';
export * from './components/compositions/index.js';
export { FlowStepShell } from './components/flow-step-shell/index.js';
export { AUTH_COMPLETED } from './features/shared-auth/types.js';
export * from './features/index.js';
export { phase4ScreenInventory } from './features/phase4-screen-inventory.js';
export * from './flow/index.js';
export * from './layouts/index.js';
export * from './providers/index.js';
export * from './router/index.js';
export * from './types/index.js';

/** @deprecated Purchase activation — dev preview only */
export { R01VehicleNumberScreen } from './features/shared-auth/screens/r01-vehicle-number/index.js';
/** @deprecated Purchase activation — dev preview only */
export { R02VehicleDetailsScreen } from './features/shared-auth/screens/r02-vehicle-details/index.js';
/** @deprecated Purchase activation — dev preview only */
export { R05AccountCreationScreen } from './features/shared-auth/screens/r05-account-creation/index.js';
/** @deprecated Purchase activation — dev preview only */
export { R06LegalConsentScreen } from './features/shared-legal/screens/r06-legal-consent/index.js';

export {
  PR01PrepaidEntryScreen,
  PR02ActivationCodeScreen,
  PR03CodeValidationScreen,
} from './features/qr-prepaid/screens/index.js';
