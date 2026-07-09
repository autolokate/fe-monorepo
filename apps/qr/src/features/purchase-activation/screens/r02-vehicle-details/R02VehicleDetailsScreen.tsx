import { AlIcon } from '@autolokate/icons';
import { AlVehicleRcCard } from '@autolokate/ui';

import { EmptyStateHero } from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import type { PurchaseActivationScreenProps } from '../../types';

export type R02VehicleDetailsScreenProps = PurchaseActivationScreenProps;

export function R02VehicleDetailsScreen({
  state = 'default',
  onContinue,
  onBack,
  showBack = true,
}: R02VehicleDetailsScreenProps) {
  const loading = state === 'loading';
  const isError = state === 'error';
  const isEmpty = state === 'empty';
  const isSuccess = state === 'success';

  return (
    <FlowStepShell
      phase="shared"
      step={2}
      title="Confirm vehicle"
      description="review your registration certificate details"
      footerLabel={loading ? 'Loading…' : isSuccess ? 'Confirmed' : 'Confirm vehicle'}
      footerLoading={loading}
      footerDisabled={isEmpty || isError || loading}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      {loading ? (
        <EmptyStateHero variant="loading" message="Fetching registration certificate…" />
      ) : null}

      {isEmpty ? (
        <EmptyStateHero
          variant="empty"
          icon={<AlIcon name="car" size={48} aria-hidden />}
          heading="No vehicle details"
          message="Enter a valid registration number to load your RC details."
        />
      ) : null}

      {isError ? (
        <EmptyStateHero
          variant="empty"
          icon={<AlIcon name="circle-x" size={48} aria-hidden />}
          heading="Couldn&apos;t load vehicle"
          message="We couldn&apos;t retrieve registration details. Try again in a moment."
        />
      ) : null}

      {!loading && !isEmpty && !isError ? (
        <AlVehicleRcCard
          registrationNumber=""
          verifiedLabel="Verified"
          verifiedIcon={<AlIcon name="circle-check" size={14} aria-hidden />}
          fields={[]}
        />
      ) : null}
    </FlowStepShell>
  );
}
