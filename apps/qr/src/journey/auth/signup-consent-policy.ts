import type { ActivationFlowId } from '@/journey/types';
import { isB2cQrChannel, isPartnerQrJourney } from '@/platform/activation/activation-channel';
import { QR_STATUS } from '@/platform/qr/qr-status';
import { getResolvedQr } from '@/storage/index';

/**
 * Inline terms/privacy on A1 (mobile):
 * - B2B / B2B2C partner flows — always required (unchanged).
 * - B2C retail — only when the sticker is still DISTRIBUTED (pre-attach purchase).
 */
export function shouldRequireSignupConsent(selectedFlow: ActivationFlowId | null): boolean {
  if (selectedFlow === 'prepaid' || selectedFlow === 'b2b2c') {
    return true;
  }

  const resolved = getResolvedQr();
  if (resolved && isPartnerQrJourney(resolved.journey)) {
    return true;
  }

  if (resolved && isB2cQrChannel(resolved.channel)) {
    return resolved.qrStatus === QR_STATUS.DISTRIBUTED;
  }

  if (selectedFlow === 'purchase' && resolved?.journey === 'CONSUMER_PREPAID') {
    return resolved.qrStatus === QR_STATUS.DISTRIBUTED;
  }

  return false;
}
