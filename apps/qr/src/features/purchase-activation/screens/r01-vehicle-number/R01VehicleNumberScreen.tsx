import { AlIcon } from '@autolokate/icons';
import { AlPlateInput, AlText } from '@autolokate/ui';

import {
  EmptyStateHero,
  FormFieldStack,
} from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import type { R01VehicleNumberScreenProps } from '../../types';
// Moved from shared-auth — Purchase activation (Figma 170:25)

export type { R01VehicleNumberScreenProps };

export function R01VehicleNumberScreen({
  state = 'default',
  onContinue,
  onBack,
  showBack = true,
  plateValue,
  onPlateChange,
}: R01VehicleNumberScreenProps) {
  const loading = state === 'loading';
  const isError = state === 'error';
  const isEmpty = state === 'empty';
  const isSuccess = state === 'success';
  const interactive = plateValue !== undefined && onPlateChange !== undefined;
  const displayPlate = interactive
    ? plateValue
    : isSuccess || isError
      ? plateValue ?? ''
      : '';

  return (
    <FlowStepShell
      phase="shared"
      step={1}
      title="Vehicle number"
      description="enter your registration number"
      footerLabel={loading ? 'Looking up…' : 'Continue'}
      footerLoading={loading}
      footerDisabled={isEmpty || (interactive && !plateValue.trim())}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      {isEmpty ? (
        <EmptyStateHero
          variant="empty"
          icon={<AlIcon name="car" size={48} aria-hidden />}
          heading="No plate entered"
          message="Enter your vehicle registration number to continue activation."
        >
          <AlPlateInput
            value={interactive ? plateValue : ''}
            onChange={onPlateChange}
            placeholder="MH 12 AB 3456"
          />
        </EmptyStateHero>
      ) : (
        <FormFieldStack>
          <AlPlateInput
            value={displayPlate}
            onChange={onPlateChange}
            placeholder="MH 12 AB 3456"
            disabled={loading}
            aria-label="Vehicle registration plate"
            aria-invalid={isError || undefined}
          />
          {isError ? (
            <AlText variant="caption" tone="muted" role="alert">
              We couldn&apos;t find that registration number. Check and try again.
            </AlText>
          ) : null}
          {isSuccess ? (
            <AlText variant="caption" tone="muted">
              Registration number verified.
            </AlText>
          ) : null}
        </FormFieldStack>
      )}
    </FlowStepShell>
  );
}
