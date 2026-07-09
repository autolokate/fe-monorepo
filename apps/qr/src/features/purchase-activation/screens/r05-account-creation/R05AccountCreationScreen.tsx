import { AlInput, AlText } from '@autolokate/ui';

import { FormFieldStack } from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import type { R05AccountCreationScreenProps } from '../../types';

export type { R05AccountCreationScreenProps };

export function R05AccountCreationScreen({
  state = 'default',
  onContinue,
  onBack,
  showBack = true,
  nameValue,
  onNameChange,
}: R05AccountCreationScreenProps) {
  const loading = state === 'loading';
  const isError = state === 'error';
  const isEmpty = state === 'empty';
  const isSuccess = state === 'success';
  const interactive = nameValue !== undefined && onNameChange !== undefined;

  return (
    <FlowStepShell
      phase="shared"
      step={5}
      title="Create account"
      description="tell us your name as on the RC"
      footerLabel={loading ? 'Creating…' : 'Continue'}
      footerLoading={loading}
      footerDisabled={isEmpty || (interactive && !nameValue.trim())}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <FormFieldStack>
        <AlInput
          label="Full name"
          value={interactive ? nameValue : undefined}
          defaultValue={interactive ? undefined : ''}
          onChange={onNameChange ? (event) => {
            onNameChange(event.target.value);
          } : undefined}
          placeholder="Your name"
          variant={isError ? 'error' : isSuccess ? 'success' : 'default'}
          errorText={isError ? 'Enter your name exactly as on the registration certificate.' : undefined}
          helperText={isSuccess ? 'Account details saved.' : undefined}
          disabled={loading}
          autoComplete="name"
          aria-invalid={isError || undefined}
        />
        {!isError && !isSuccess && !isEmpty ? (
          <AlText variant="caption" tone="muted">
            This name will appear on your protection profile.
          </AlText>
        ) : null}
      </FormFieldStack>
    </FlowStepShell>
  );
}
