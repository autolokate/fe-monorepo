import type { ActivationPreviewDto } from '@autolokate/api-client';
import { formatInrFromPaise } from '@autolokate/utils';

import type { LandingEntitlement } from '@/features/b2b-shared/types-landing';
import type { PurchaseRiderCount } from '@/features/qr-purchase/types-checkout';
import {
  ACTIVATION_PREVIEW_CHANNEL,
  type PartnerActivationKind,
} from '@/platform/activation/activation-channel';
import type { QrB2b2cPayload, QrPrepaidPayload } from '@/platform/qr/qr-dispatch-contract';
import { mapApiTierToPurchasePlanId } from '@/services/plan/plan-mapper';

export type ActivationFlowKind = 'prepaid' | 'b2b2c';

const PREPAID_SECTION_LABEL = 'Covered by';
const B2B2C_SECTION_LABEL = 'You got this from';

const PREPAID_BODY_COPY = 'Your sponsor set up and paid for your plan. Nothing to pay.';
const B2B2C_BODY_COPY = 'Your partner set up and paid for your plan. Activate it now.';
const B2B2C_RIDER_BODY_COPY =
  'Your partner set up and paid for your plan and rider. Activate it now.';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'AL';
  }
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatVehicleDisplay(vehicleDisplay: unknown): string {
  if (typeof vehicleDisplay === 'string' && vehicleDisplay.trim()) {
    return vehicleDisplay.trim();
  }
  if (vehicleDisplay && typeof vehicleDisplay === 'object') {
    const record = vehicleDisplay as Record<string, unknown>;
    const label = record['label'] ?? record['display'] ?? record['plate'];
    if (typeof label === 'string' && label.trim()) {
      return label.trim();
    }
  }
  return 'Your vehicle';
}

function resolvePartnerSubtitle(preview: ActivationPreviewDto): string {
  if (preview.partner?.kind.trim()) {
    return preview.partner.kind.trim();
  }
  if (preview.channel === ACTIVATION_PREVIEW_CHANNEL.B2B) {
    return 'Pre-paid by your company';
  }
  return 'Authorised partner';
}

function resolvePriceDisplay(pricePaise: number): string | undefined {
  if (pricePaise <= 0) {
    return undefined;
  }
  return `${formatInrFromPaise(pricePaise)}/year`;
}

function clampRiderCount(count: number): PurchaseRiderCount {
  if (count >= 2) {
    return 2;
  }
  if (count >= 1) {
    return 1;
  }
  return 0;
}

function resolveFlowKind(preview: ActivationPreviewDto): ActivationFlowKind {
  return preview.channel === ACTIVATION_PREVIEW_CHANNEL.B2B ? 'prepaid' : 'b2b2c';
}

/** Map backend preview into the existing welcome entitlement card shape. */
export function mapPreviewToLandingEntitlement(preview: ActivationPreviewDto): LandingEntitlement {
  const resolvedFlow = resolveFlowKind(preview);
  const planId = mapApiTierToPurchasePlanId(preview.planTier);
  const riderCount = clampRiderCount(preview.riderCount);
  const partnerName = preview.partner?.name.trim() || 'Your sponsor';
  const planStatusLabel: LandingEntitlement['planStatusLabel'] = 'Paid';

  return {
    title: 'Activate your plan',
    bodyCopy:
      resolvedFlow === 'prepaid'
        ? PREPAID_BODY_COPY
        : riderCount > 0
          ? B2B2C_RIDER_BODY_COPY
          : B2B2C_BODY_COPY,
    sectionLabel: resolvedFlow === 'prepaid' ? PREPAID_SECTION_LABEL : B2B2C_SECTION_LABEL,
    partnerName,
    partnerInitials: initialsFromName(partnerName),
    partnerSubtitle: resolvePartnerSubtitle(preview),
    vehiclePlate: formatVehicleDisplay(preview.vehicleDisplay),
    planId,
    riderCount,
    planStatusLabel,
    priceDisplay: resolvePriceDisplay(preview.pricePaise),
  };
}

export function createActivationIdempotencyKey(): string {
  return crypto.randomUUID();
}

const B2B_QR_CODE_PATTERN = /^ALK-FRB(\d+)$/i;
const B2B_ENTITLEMENT_PREFIX = 'ENT-FR';

/** Map fleet QR sticker codes to B2B entitlement codes for preview/redeem. */
export function resolveB2bEntitlementCodeFromQrCode(
  qrCode: string,
  skuCode?: string | null,
): string | null {
  const trimmedQr = qrCode.trim();
  if (!trimmedQr) {
    return null;
  }

  const frbMatch = trimmedQr.match(B2B_QR_CODE_PATTERN);
  if (frbMatch?.[1]) {
    return `${B2B_ENTITLEMENT_PREFIX}-${frbMatch[1]}`;
  }

  const sku = skuCode?.trim();
  const numericSuffix = trimmedQr.match(/(\d+)$/)?.[1];
  if (!numericSuffix) {
    return sku && sku.length > 0 ? sku : null;
  }

  if (sku && /^ENT-FR$/i.test(sku)) {
    return `${B2B_ENTITLEMENT_PREFIX}-${numericSuffix}`;
  }

  if (sku && /^ENT-FR-\d+$/i.test(sku)) {
    return sku.toUpperCase();
  }

  return sku ?? null;
}

export function resolvePartnerEntitlementCode(params: {
  qrCode: string;
  partnerKind: PartnerActivationKind;
  skuCode?: string | null;
}): string | null {
  if (params.partnerKind !== 'b2b') {
    return null;
  }
  return resolveB2bEntitlementCodeFromQrCode(params.qrCode, params.skuCode);
}

export function resolveActivationPreviewCode(params: {
  partnerKind: PartnerActivationKind;
  qrCode: string;
  entitlementCode?: string | null;
}): string {
  if (params.partnerKind === 'b2b') {
    return params.entitlementCode?.trim() || params.qrCode.trim();
  }
  return params.qrCode.trim();
}

export function resolveEntitlementCodeFromPayload(
  payload: QrPrepaidPayload | QrB2b2cPayload,
): string | null {
  if (payload.type === 'prepaid') {
    return payload.voucherId.trim() || null;
  }
  return payload.partnerId.trim() || null;
}

export function resolvePartnerKindFromFlow(flow: ActivationFlowKind): PartnerActivationKind {
  return flow === 'prepaid' ? 'b2b' : 'b2b2c';
}
