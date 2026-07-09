import { AlInput, AlText } from '@autolokate/ui';

import {
  FormFieldStack,
  InlineStatusBanner,
} from '@/components/compositions/index.js';
import { FlowStepShell } from '@/components/flow-step-shell/index.js';
import type { PrepaidScreenState } from '../../types.js';
import { demoActivationCode } from '../../data/activation-data.js';

export type PR02ActivationCodeScreenProps = {
  state?: PrepaidScreenState;
};

export function PR02ActivationCodeScreen({ state = 'default' }: PR02ActivationCodeScreenProps) {
  const loading = state === 'loading';
  const isError = state === 'error';
  const isSuccess = state === 'success';

  return (
    <FlowStepShell
      phase="prepaid"
      step={2}
      title="Activation code"
      description="enter the code from your fleet administrator"
      footerLabel={loading ? 'Checking…' : isSuccess ? 'Continue' : 'Validate code'}
      footerLoading={loading}
      footerDisabled={isError}
    >
      {isError ? (
        <InlineStatusBanner variant="error">
          Invalid or expired activation code. Check with your fleet administrator.
        </InlineStatusBanner>
      ) : null}
      {isSuccess ? (
        <InlineStatusBanner variant="success">Activation code format accepted.</InlineStatusBanner>
      ) : null}
      <FormFieldStack>
        <AlInput
          label="Activation code"
          defaultValue={isSuccess || (state === 'default' && !isError) ? demoActivationCode : ''}
          placeholder="FLT-2026-AB12"
          variant={isError ? 'error' : isSuccess ? 'success' : 'default'}
          errorText={isError ? 'Enter a valid activation code.' : undefined}
          helperText={isSuccess ? 'Code ready for validation.' : undefined}
          disabled={loading || isSuccess}
        />
        {!isError && !isSuccess ? (
          <AlText variant="caption" tone="muted">
            Codes are case-insensitive and unique to your organisation.
          </AlText>
        ) : null}
      </FormFieldStack>
    </FlowStepShell>
  );
}
