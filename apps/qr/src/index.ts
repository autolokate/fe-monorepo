export * from './app/index';
export * from './components/compositions/index';
export { FlowStepShell } from './components/flow-step-shell/index';
export { AUTH_COMPLETED } from './features/shared-auth/types';
export * from './features/index';
export { phase4ScreenInventory } from './features/phase4-screen-inventory';
export * from './flow/index';
export * from './layouts/index';
export * from './providers/index';
export * from './router/index';
export * from './types/index';

/** @deprecated Purchase activation — dev preview only */
export { R01VehicleNumberScreen } from './features/shared-auth/screens/r01-vehicle-number/index';
/** @deprecated Purchase activation — dev preview only */
export { R02VehicleDetailsScreen } from './features/shared-auth/screens/r02-vehicle-details/index';
/** @deprecated Purchase activation — dev preview only */
export { R05AccountCreationScreen } from './features/shared-auth/screens/r05-account-creation/index';
/** @deprecated Purchase activation — dev preview only */
export { R06LegalConsentScreen } from './features/shared-legal/screens/r06-legal-consent/index';

export {
  PR01PrepaidEntryScreen,
  PR02ActivationCodeScreen,
  PR03CodeValidationScreen,
} from './features/qr-prepaid/screens/index';
