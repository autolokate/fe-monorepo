export type PurchaseVehiclePlateState = 'empty' | 'filled' | 'error' | 'loading';

export type PurchaseVehicleScreenProps = {
  plateValue?: string;
  plateState?: PurchaseVehiclePlateState;
  onPlateChange?: (value: string) => void;
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  title?: string;
  description?: string;
};

export type PurchaseFetchingScreenProps = {
  onBack?: () => void;
  title?: string;
  description?: string;
};

export type PurchaseFetchFailedScreenProps = {
  onRetry?: () => void;
  onEnterManually?: () => void;
};

import type { AlVehicleRcField } from '@autolokate/ui';

export type PurchaseConfirmVehicleScreenProps = {
  plate?: string;
  fields?: AlVehicleRcField[];
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  title?: string;
  description?: string;
  footerLabel?: string;
  protectedPlan?: boolean;
  planLabel?: string;
  footerLoading?: boolean;
};
