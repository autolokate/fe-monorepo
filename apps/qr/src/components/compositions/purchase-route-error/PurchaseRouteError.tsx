import { AlIcon } from '@autolokate/icons';

import { PurchaseStatusShell } from '@/components/compositions/purchase-status-shell/index';

export type PurchaseRouteErrorProps = {
  /** Prefer the message returned by the failing endpoint. */
  message: string;
  onRetry: () => void;
  title?: string;
  retryLabel?: string;
  onBack?: () => void;
  showBack?: boolean;
};

/** Shared attention-state for purchase route load failures (plans, riders, cart, …). */
export function PurchaseRouteError({
  message,
  onRetry,
  title = 'We couldn’t load this step',
  retryLabel = 'Try again',
  onBack,
  showBack = false,
}: PurchaseRouteErrorProps) {
  const description = message.trim() || 'Something went wrong. Please try again.';

  return (
    <PurchaseStatusShell
      ambient="attention"
      title={title}
      description={description}
      showBack={showBack}
      onBack={onBack}
      visual={
        <AlIcon
          name="fetch-failed-halo"
          size={240}
          className="ob-purchase-status-halo"
          aria-hidden
        />
      }
      footerLabel={retryLabel}
      onContinue={onRetry}
    />
  );
}
