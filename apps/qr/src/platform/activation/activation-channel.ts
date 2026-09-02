import type { ActivationPreviewChannel, QrChannel, QrJourney } from '@autolokate/api-client';

/** Preview channel values returned by GET /v1/activation/preview. */
export type { ActivationPreviewChannel };

/** Partner preview channels from GET /v1/activation/preview. */
export const ACTIVATION_PREVIEW_CHANNEL = {
  B2C: 'B2C',
  B2B2C: 'B2B2C',
  B2B: 'B2B',
} as const satisfies Record<string, ActivationPreviewChannel>;

export type PartnerActivationKind = 'b2b2c' | 'b2b';

/** Activation preview kinds — partner redeem flows + B2C prepaid welcome. */
export type ActivationKind = PartnerActivationKind | 'b2c';

/** B2C channel on QR resolve — route to consumer purchase. */
export function isB2cQrChannel(channel: QrChannel): boolean {
  return channel === 'B2C';
}

export function isPartnerQrJourney(journey: QrJourney): boolean {
  return journey === 'PARTNER_ATTACH' || journey === 'PREPAID_REDEEM';
}

export function isPartnerActivationKind(kind: ActivationKind): kind is PartnerActivationKind {
  return kind === 'b2b' || kind === 'b2b2c';
}

/** Map QR resolve journey to partner activation kind. */
export function resolvePartnerKindFromJourney(journey: QrJourney): PartnerActivationKind | null {
  switch (journey) {
    case 'PARTNER_ATTACH':
      return 'b2b2c';
    case 'PREPAID_REDEEM':
      return 'b2b';
    default:
      return null;
  }
}

/** Map preview channel to partner activation kind. */
export function resolvePartnerKindFromPreviewChannel(
  channel: ActivationPreviewChannel,
): PartnerActivationKind | null {
  if (channel === ACTIVATION_PREVIEW_CHANNEL.B2B) {
    return 'b2b';
  }
  if (channel === ACTIVATION_PREVIEW_CHANNEL.B2B2C) {
    return 'b2b2c';
  }
  return null;
}
