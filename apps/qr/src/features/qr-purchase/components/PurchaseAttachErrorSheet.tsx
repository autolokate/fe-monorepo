import { AlPermissionSheet } from '@autolokate/ui';

import type { QrAttachError } from '@/services/qr/qr-attach-errors';

import { buildPurchaseSupportMailto, PURCHASE_SUPPORT_EMAIL } from '../constants/purchase-support';
import { resolveAttachErrorPresentation } from '../utils/attach-error-presentation';
import './purchase-attach-error-sheet.css';

export type PurchaseAttachErrorSheetProps = {
  open: boolean;
  error: QrAttachError | null;
  onRetry: () => void;
  onDismiss?: () => void;
};

/** Bottom sheet when POST /v1/qr/{code}/attach fails — blocks purchase until resolved. */
export function PurchaseAttachErrorSheet({
  open,
  error,
  onRetry,
  onDismiss,
}: PurchaseAttachErrorSheetProps) {
  if (!error) {
    return null;
  }

  const { title, description } = resolveAttachErrorPresentation(error);

  return (
    <AlPermissionSheet
      open={open}
      title={title}
      description={description}
      primaryLabel="Try again"
      onPrimary={onRetry}
      secondaryLabel="Contact us"
      onSecondary={() => {
        window.location.href = buildPurchaseSupportMailto('Help linking my Autolokate QR code');
      }}
      onDismiss={onDismiss}
    >
      <p className="ob-purchase-attach-error-sheet__support">
        Reach us at{' '}
        <a
          href={`mailto:${PURCHASE_SUPPORT_EMAIL}`}
          className="ob-purchase-attach-error-sheet__email"
        >
          {PURCHASE_SUPPORT_EMAIL}
        </a>
      </p>
    </AlPermissionSheet>
  );
}
