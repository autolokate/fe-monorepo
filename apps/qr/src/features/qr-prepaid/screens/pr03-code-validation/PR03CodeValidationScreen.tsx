import { AlIcon } from '@autolokate/icons';

import {
  EmptyStateHero,
  InlineStatusBanner,
} from '@/components/compositions/index.js';
import { FlowStepShell } from '@/components/flow-step-shell/index.js';
import type { PrepaidScreenState } from '../../types.js';
import { demoActivationCode, prepaidOrgName } from '../../data/activation-data.js';

export type PR03CodeValidationScreenProps = {
  state?: PrepaidScreenState;
};

export function PR03CodeValidationScreen({ state = 'default' }: PR03CodeValidationScreenProps) {
  const validating = state === 'loading' || state === 'default';
  const isInvalid = state === 'error';
  const isSuccess = state === 'success';

  return (
    <FlowStepShell
      phase="prepaid"
      step={3}
      title="Validating code"
      description="confirming with your organisation"
      footerLabel={
        isInvalid ? 'Try again' : isSuccess ? 'Continue to vehicle' : 'Validating…'
      }
      footerLoading={validating && !isInvalid}
      footerDisabled={validating && !isInvalid && !isSuccess}
    >
      {isInvalid ? (
        <InlineStatusBanner variant="error">
          This activation code is invalid or has already been used.
        </InlineStatusBanner>
      ) : null}
      {isSuccess ? (
        <InlineStatusBanner variant="success">
          {demoActivationCode} verified for {prepaidOrgName}.
        </InlineStatusBanner>
      ) : null}
      {validating && !isInvalid && !isSuccess ? (
        <EmptyStateHero
          variant="processing"
          message="Validating activation code with your organisation…"
        />
      ) : null}
      {isSuccess ? (
        <EmptyStateHero
          variant="success"
          icon={<AlIcon name="circle-check" size={48} aria-hidden />}
          heading="Code verified"
          message="Your pre-paid plan is ready. Continue to vehicle verification."
        />
      ) : null}
      {isInvalid ? (
        <EmptyStateHero
          variant="empty"
          icon={<AlIcon name="circle-x" size={48} aria-hidden />}
          heading="Invalid activation code"
          message="Check the code from your fleet administrator and try again."
        />
      ) : null}
    </FlowStepShell>
  );
}
