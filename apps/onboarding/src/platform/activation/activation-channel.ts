import type { QrChannel, QrJourney } from '@autolokate/api-client';

/** Preview channel values returned by GET /v1/activation/preview. */
export type ActivationPreviewChannel = 'B2B2C' | 'B2B';

/** Partner preview channels from GET /v1/activation/preview. */
export const ACTIVATION_PREVIEW_CHANNEL = {
  B2B2C: 'B2B2C',
  B2B: 'B2B',
} as const satisfies Record<string, ActivationPreviewChannel>;

export type PartnerActivationKind = 'b2b2c' | 'b2b';

/** B2C retail channels on QR resolve — route to consumer purchase. */
const B2C_QR_CHANNELS = new Set<QrChannel>(['B2C_RETAIL_ONLINE', 'B2C_RETAIL_OFFLINE']);

export function isB2cQrChannel(channel: QrChannel): boolean {
  return B2C_QR_CHANNELS.has(channel);
}

export function isPartnerQrJourney(journey: QrJourney): boolean {
  return journey === 'PARTNER_ATTACH' || journey === 'PREPAID_REDEEM';
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
): PartnerActivationKind {
  return channel === ACTIVATION_PREVIEW_CHANNEL.B2B ? 'b2b' : 'b2b2c';
}
