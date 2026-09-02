import { AlIcon } from '@autolokate/icons';

import { AlOfflineChip, EmptyStateHero } from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import { DEFAULT_PURCHASE_PLAN_ID } from '@/features/qr-purchase/data/purchase-plans';
import {
  getEntitledRiderSlots,
  getRiderPromptDescription,
  getRiderPromptOfflineDescription,
} from '../../emergency-limits';
import type { EmergencyRiderPromptState, EmergencyScreenNavigationProps } from '../../types';

import '../../emergency.css';

export type E01RiderPromptScreenProps = EmergencyScreenNavigationProps & {
  viewState?: EmergencyRiderPromptState;
  description?: string;
  /** API error message — shown only when the backend returned a message. */
  errorMessage?: string | null;
};

const defaultRiderDescription = getRiderPromptDescription(
  getEntitledRiderSlots(DEFAULT_PURCHASE_PLAN_ID, 1),
);

/** R0 · Rider prompt — Figma 375:37 */
export function E01RiderPromptScreen({
  viewState = 'default',
  description = defaultRiderDescription,
  errorMessage = null,
  onContinue,
  onBack,
  showBack = true,
  footerSecondaryLabel = 'Skip for now',
  onFooterSecondary,
}: E01RiderPromptScreenProps) {
  const isLoading = viewState === 'loading';
  const isOffline = viewState === 'offline';
  const isError = viewState === 'error';
  // Non-input screen: API errors use snackbar only — never also replace description.
  void errorMessage;

  const resolvedDescription = isOffline ? getRiderPromptOfflineDescription() : description;

  return (
    <FlowStepShell
      phase="emergency"
      step={1}
      title="Add your rider’s details?"
      description={resolvedDescription}
      footerLabel={isError ? 'Try again' : 'Add rider details'}
      footerLoading={isLoading}
      footerDisabled={isOffline || isLoading}
      hideProgress
      headerAccessory={isOffline ? <AlOfflineChip /> : undefined}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      footerSecondaryLabel={footerSecondaryLabel}
      onFooterSecondary={onFooterSecondary}
    >
      <EmptyStateHero
        icon={
          <div className="ob-emergency-hero-icon">
            <AlIcon name="circle-user" size={50} aria-hidden />
          </div>
        }
      />
    </FlowStepShell>
  );
}
