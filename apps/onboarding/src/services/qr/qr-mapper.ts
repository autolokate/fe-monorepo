import type { QrJourney, QrResolution, QrStatus } from '@autolokate/api-client';

import type { ActivationFlowId } from '@/journey/types.js';
import {
  isActivatedQrLifecycleStatus,
  isExpiredQrLifecycleStatus,
  QR_STATUS,
} from '@/platform/qr/qr-status.js';
import type {
  QrActivatedPayload,
  QrB2b2cPayload,
  QrPayload,
  QrPrepaidPayload,
  QrPurchasePayload,
} from '@/platform/qr/qr-dispatch-contract.js';
import { formatApiTierLabel } from '@/services/plan/plan-mapper.js';

/** Map backend journey to existing activation flow ids — no new flow types. */
export function mapQrJourneyToActivationFlow(journey: QrJourney): ActivationFlowId | null {
  switch (journey) {
    case 'CONSUMER_SELF_PAY':
      return 'purchase';
    case 'PREPAID_REDEEM':
      return 'prepaid';
    case 'PARTNER_ATTACH':
      return 'b2b2c';
    case 'NONE':
      return null;
    default:
      return null;
  }
}

function buildActivatedPayload(code: string, resolution: QrResolution): QrActivatedPayload | null {
  const vehicle = resolution.vehicle;
  if (!vehicle?.plate) {
    return null;
  }

  const tier = resolution.offeredSku?.offeredTiers[0];
  return {
    type: 'activated',
    vehicleId: code,
    plate: vehicle.plate,
    ...(tier ? { planLabel: formatApiTierLabel(tier).replace(' Plus', '+') } : {}),
  };
}

function buildPurchasePayload(code: string): QrPurchasePayload {
  return { type: 'purchase', token: code };
}

function buildPrepaidPayload(code: string, resolution: QrResolution): QrPrepaidPayload {
  return {
    type: 'prepaid',
    voucherId: resolution.offeredSku?.skuCode ?? code,
  };
}

function buildB2b2cPayload(code: string, resolution: QrResolution): QrB2b2cPayload {
  const riderDefault = resolution.offeredSku?.riderDefault ?? 0;
  return {
    type: 'b2b2c',
    partnerId: resolution.offeredSku?.skuCode ?? code,
    variant: riderDefault > 0 ? 'plan-rider' : 'plan-only',
  };
}

/** True when the QR lifecycle status blocks activation. */
export function isExpiredQrStatus(status: QrStatus): boolean {
  return isExpiredQrLifecycleStatus(status);
}

/** True when the code is already active for bystander scan. */
export function isActivatedQrResolution(resolution: QrResolution): boolean {
  return isActivatedQrLifecycleStatus(resolution.qrStatus) && Boolean(resolution.vehicle);
}

/**
 * Map resolve DTO into the legacy dispatch payload shape.
 * Returns null when the resolution cannot be routed.
 */
export function mapResolutionToPayload(code: string, resolution: QrResolution): QrPayload | null {
  if (isExpiredQrStatus(resolution.qrStatus)) {
    return null;
  }

  if (isActivatedQrResolution(resolution)) {
    return buildActivatedPayload(code, resolution);
  }

  if (resolution.qrStatus === QR_STATUS.ACTIVATED) {
    return null;
  }

  switch (resolution.journey) {
    case 'CONSUMER_SELF_PAY':
      return buildPurchasePayload(code);
    case 'PREPAID_REDEEM':
      return buildPrepaidPayload(code, resolution);
    case 'PARTNER_ATTACH':
      return buildB2b2cPayload(code, resolution);
    case 'NONE':
      return null;
    default:
      return null;
  }
}
