import type { QrResolution } from '@autolokate/api-client';

import { b2b2cJourneyPaths } from '@/journey/b2b2c/b2b2c-routing.js';
import { prepaidJourneyPaths } from '@/journey/prepaid/prepaid-routing.js';
import type { ActivationFlowId } from '@/journey/types.js';
import {
  type PartnerActivationKind,
  resolvePartnerKindFromJourney,
} from '@/platform/activation/activation-channel.js';
import { isPostActivationQrResolution } from '@/journey/state/purchase-journey-state-machine.js';
import { isActivatedQrResolution } from '@/services/qr/qr-mapper.js';

export const PARTNER_JOURNEY_TARGET = {
  PURCHASE: 'purchase',
  PARTNER_B2B2C: 'partner-b2b2c',
  PARTNER_B2B: 'partner-b2b',
  POST_ACTIVATION: 'post-activation',
} as const;

export type PartnerJourneyTarget =
  (typeof PARTNER_JOURNEY_TARGET)[keyof typeof PARTNER_JOURNEY_TARGET];

/** Central QR resolve → journey routing. B2C purchase vs partner activation vs post-activation. */
export function resolveQrJourneyTarget(resolution: QrResolution): PartnerJourneyTarget | null {
  if (isPostActivationQrResolution(resolution) || isActivatedQrResolution(resolution)) {
    return PARTNER_JOURNEY_TARGET.POST_ACTIVATION;
  }

  switch (resolution.journey) {
    case 'CONSUMER_SELF_PAY':
      return PARTNER_JOURNEY_TARGET.PURCHASE;
    case 'PARTNER_ATTACH':
      return PARTNER_JOURNEY_TARGET.PARTNER_B2B2C;
    case 'PREPAID_REDEEM':
      return PARTNER_JOURNEY_TARGET.PARTNER_B2B;
    default:
      return null;
  }
}

export function resolvePartnerKindFromTarget(
  target: PartnerJourneyTarget,
): PartnerActivationKind | null {
  switch (target) {
    case PARTNER_JOURNEY_TARGET.PARTNER_B2B2C:
      return 'b2b2c';
    case PARTNER_JOURNEY_TARGET.PARTNER_B2B:
      return 'b2b';
    default:
      return null;
  }
}

export function resolvePartnerKindFromResolution(
  resolution: QrResolution,
): PartnerActivationKind | null {
  return resolvePartnerKindFromJourney(resolution.journey);
}

export function resolvePartnerFlowId(kind: PartnerActivationKind): ActivationFlowId {
  return kind === 'b2b' ? 'prepaid' : 'b2b2c';
}

/** Welcome route for partner activation — rider screen variant from preview riderCount. */
export function resolvePartnerWelcomePath(
  kind: PartnerActivationKind,
  riderCount: number,
): string {
  if (kind === 'b2b') {
    return prepaidJourneyPaths.welcome;
  }
  return riderCount > 0 ? b2b2cJourneyPaths.welcomePlanRider : b2b2cJourneyPaths.welcome;
}

export function resolvePartnerVariantFromRiderCount(
  riderCount: number,
): 'plan-only' | 'plan-rider' {
  return riderCount > 0 ? 'plan-rider' : 'plan-only';
}
