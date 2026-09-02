import { AlIcon } from '@autolokate/icons';
import { AlVehicleRcCard } from '@autolokate/ui';

import { AuthStepShell } from '@/components/auth-step-shell/index';
import type { PurchaseConfirmVehicleScreenProps } from '../../types-vehicle';

import '../purchase-vehicle.css';

/** R05 · Confirm vehicle — Figma 170:71 */
export function R05ConfirmVehicleScreen({
  plate = '',
  fields = [],
  onContinue,
  onBack,
  showBack = true,
  title = 'Confirm your vehicle',
  description = 'We fetched these details from Vahan. Tap to confirm',
  footerLabel = 'Looks right',
  protectedPlan = false,
  planLabel,
  footerLoading = false,
}: PurchaseConfirmVehicleScreenProps) {
  return (
    <AuthStepShell
      hideProgress
      progressConfig={null}
      shellClassName="ob-auth-shell--purchase"
      title={title}
      description={description}
      footerLabel={footerLabel}
      footerLoading={footerLoading}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      contentGap="mobile"
    >
      <AlVehicleRcCard
        registrationNumber={plate}
        verifiedLabel="Verified"
        verifiedIcon={<AlIcon name="circle-check" size={14} aria-hidden />}
        watermarkIcon={<AlIcon name="car" size={170} aria-hidden />}
        fields={fields}
        className={protectedPlan ? 'ob-r05-vehicle-rc-card--protected' : undefined}
      />
      {protectedPlan && planLabel ? (
        <p className="ob-r05-protected-label">Protected by Autolokate · {planLabel}</p>
      ) : null}
    </AuthStepShell>
  );
}
