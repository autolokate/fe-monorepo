import type { ScreenViewState } from '../../types/flow.js';

export type PurchaseActivationNavigationProps = {
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export type PurchaseActivationScreenProps = PurchaseActivationNavigationProps & {
  state?: ScreenViewState;
};

export type R01VehicleNumberScreenProps = PurchaseActivationScreenProps & {
  plateValue?: string;
  onPlateChange?: (value: string) => void;
};

export type R05AccountCreationScreenProps = PurchaseActivationScreenProps & {
  nameValue?: string;
  onNameChange?: (value: string) => void;
};

export type R06LegalConsentScreenProps = PurchaseActivationScreenProps & {
  legalAccepted?: boolean;
  onLegalAcceptedChange?: (accepted: boolean) => void;
};
