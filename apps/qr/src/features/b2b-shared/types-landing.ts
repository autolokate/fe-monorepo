import type { PurchasePlanId, PurchaseRiderCount } from '../qr-purchase/types-checkout';

/** Figma AlPartnerCard + plan activation card content — populated from GET /v1/activation/preview. */
export type LandingEntitlement = {
  partnerName: string;
  partnerInitials: string;
  partnerSubtitle: string;
  sectionLabel: string;
  /** False when GET /v1/activation/preview returns partner: null (typical B2C retail). */
  hasPartner: boolean;
  vehiclePlate: string;
  planId: PurchasePlanId;
  /** Sold plan display name from preview (`planName`). */
  planName: string;
  /** Feature bullets from preview (`features`). */
  features: readonly string[];
  riderCount: PurchaseRiderCount;
  planStatusLabel: 'Paid';
  priceDisplay?: string;
  title: string;
  bodyCopy: string;
};

export type WelcomeViewState = 'loading' | 'default' | 'error';

export type PrepaidLandingSession = {
  entitlement?: LandingEntitlement;
  /** Set when entering via prepaid QR sticker. */
  voucherId?: string;
};

export type B2b2cLandingSession = {
  entitlement?: LandingEntitlement;
  variant?: 'plan-only' | 'plan-rider';
  /** Set when entering via B2B2C QR sticker. */
  partnerId?: string;
};
