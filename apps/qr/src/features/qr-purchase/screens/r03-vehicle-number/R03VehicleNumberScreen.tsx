import { AlPlateInput } from '@autolokate/ui';

import { AuthStepShell } from '@/components/auth-step-shell/index';
import { TrustRow } from '@/components/compositions/trust-row/TrustRow';
import { VahanPreviewChips } from '@/components/compositions/vahan-preview-chips/index';
import { isPlateEntryReady } from '@/services/vehicle/index';
import type { PurchaseVehicleScreenProps } from '../../types-vehicle';

import '../purchase-vehicle.css';

/** R03 · Vehicle number — Figma 170:25 · R03b · Vehicle not found — 579:1700 */
export function R03VehicleNumberScreen({
  plateValue = '',
  plateState = 'empty',
  plateErrorMessage,
  onPlateChange,
  onContinue,
  onBack,
  showBack = true,
  title = 'Add your vehicle',
  description = "Type your plate number, we'll pull the rest from Vahan",
}: PurchaseVehicleScreenProps) {
  const isLoading = plateState === 'loading';
  const isError = plateState === 'error';
  const canSubmit = isPlateEntryReady(plateValue) && !isLoading;
  const ctaHelper = !canSubmit && !isError ? 'Enter your number to continue' : undefined;
  const errorMessage = plateErrorMessage ?? "We couldn't find that number, check and try again";
  return (
    <AuthStepShell
      hideProgress
      progressConfig={null}
      shellClassName="ob-auth-shell--purchase"
      title={title}
      description={description}
      footerLabel={isLoading ? 'Fetching…' : 'Fetch from Vahan'}
      footerLoading={isLoading}
      footerDisabled={!canSubmit}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      ctaHelper={ctaHelper}
      contentGap="mobile"
    >
      <div className="ob-r03-vehicle-stack">
        <AlPlateInput
          value={plateValue}
          onChange={onPlateChange}
          placeholder="MH 12 AB 3456"
          disabled={isLoading}
          error={isError}
          aria-label="Vehicle registration plate"
        />
        {isError ? (
          <p className="ob-plate-error-message" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <VahanPreviewChips />
        <TrustRow text="We only read your RC details · encrypted" align="start" />
      </div>
    </AuthStepShell>
  );
}
