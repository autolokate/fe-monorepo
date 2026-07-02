import type { B2b2cLandingSession, PrepaidLandingSession } from '../features/b2b-shared/types-landing.js';
import type { EmergencySession } from '../features/emergency/types.js';
import type { PurchaseCheckoutSession } from '../features/qr-purchase/types-checkout.js';
import type { AuthLanguageId } from '../features/shared-auth/types.js';
import type { AUTH_COMPLETED } from '../features/shared-auth/types.js';
import type { AlVehicleRcField } from '@autolokate/ui';

/** Consumer activation flows available on Flow Entry. */
export type ActivationFlowId = 'purchase' | 'prepaid' | 'b2b2c';

export type JourneyPhase =
  | 'home'
  | 'flow-select'
  | 'shared-auth'
  | 'activation'
  | 'emergency'
  | 'completed';

export type AuthStatus = 'pending' | typeof AUTH_COMPLETED;

export type AuthSession = {
  mobile?: string;
  mobileDisplay?: string;
  consentAccepted?: boolean;
  languageId?: AuthLanguageId;
  otpVerified?: boolean;
  ownerName?: string;
};

export type VehicleFetchStatus = 'idle' | 'fetching' | 'success' | 'not-found' | 'error';

export type VehicleSession = {
  plate?: string;
  fields?: AlVehicleRcField[];
  fetchStatus?: VehicleFetchStatus;
  confirmed?: boolean;
};

export type { PurchaseCheckoutSession } from '../features/qr-purchase/types-checkout.js';

export type JourneySession = {
  auth?: AuthSession;
  vehicle?: VehicleSession;
  purchase?: PurchaseCheckoutSession;
  prepaid?: PrepaidLandingSession;
  b2b2c?: B2b2cLandingSession;
  /** @deprecated Purchase activation — use auth.mobile */
  plate?: string;
  /** @deprecated Purchase activation — use auth.mobile */
  mobile?: string;
  otpVerified?: boolean;
  /** @deprecated Inline consent on Mobile */
  legalAccepted?: boolean;
  emergency?: EmergencySession;
};

export type PersistedJourneyState = {
  selectedFlow: ActivationFlowId | null;
  authStatus: AuthStatus;
  session: JourneySession;
};

export type JourneyContextValue = PersistedJourneyState & {
  phase: JourneyPhase;
  setSelectedFlow: (flow: ActivationFlowId) => void;
  completeAuth: () => void;
  clearJourney: () => void;
  resetForNewQrEntry: () => void;
  setPhase: (phase: JourneyPhase) => void;
  updateSession: (patch: Partial<JourneySession>) => void;
};
