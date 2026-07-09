import type { PurchasePlanId, PurchaseRiderCount } from '../qr-purchase/types-checkout.js';

/** Figma AlPartnerCard + plan activation card content. */
export type LandingEntitlement = {
  partnerName: string;
  partnerInitials: string;
  partnerSubtitle: string;
  sectionLabel: string;
  vehiclePlate: string;
  planId: PurchasePlanId;
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
