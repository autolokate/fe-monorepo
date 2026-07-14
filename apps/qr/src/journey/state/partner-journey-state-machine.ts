import type { QrResolution } from '@autolokate/api-client';

import { buildB2b2cPaths, buildPrepaidPaths, parseJourneyIdFromPathname } from '@/journey/routing/journey-url-routing';
import type { ActivationFlowId } from '@/journey/types';
import {
  type PartnerActivationKind,
  resolvePartnerKindFromJourney,
} from '@/platform/activation/activation-channel';
import { isPostActivationQrResolution } from '@/journey/state/purchase-journey-state-machine';
import { isActivatedQrResolution } from '@/services/qr/qr-mapper';

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
  journeyId?: string,
): string {
  const id =
    journeyId?.trim() ||
    (typeof window !== 'undefined' ? parseJourneyIdFromPathname(window.location.pathname) : null) ||
    '_';
  if (kind === 'b2b') {
    return buildPrepaidPaths(id).welcome;
  }
  const b2b2c = buildB2b2cPaths(id);
  return riderCount > 0 ? b2b2c.welcomePlanRider : b2b2c.welcome;
}

export function resolvePartnerVariantFromRiderCount(
  riderCount: number,
): 'plan-only' | 'plan-rider' {
  return riderCount > 0 ? 'plan-rider' : 'plan-only';
}
