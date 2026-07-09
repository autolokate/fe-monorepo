import { AlTextField } from '@autolokate/ui';

import { AuthStepShell } from '@/components/auth-step-shell/index.js';
import { useAuthRouteProgress } from '@/journey/progress/index.js';
import type { A3VehicleOwnerScreenProps } from '../../types.js';

/** A3 · Vehicle owner — Figma 174:25 · R02 · Your name */
export function A3VehicleOwnerScreen({
  nameValue = '',
  onNameChange,
  nameState = 'empty',
  onContinue,
  onBack,
  showBack = true,
  title = 'What should we call you?',
  description = 'So we can personalise your alerts and dashboard',
  footerLabel,
}: A3VehicleOwnerScreenProps) {
  const isLoading = nameState === 'loading';
  const isError = nameState === 'error';
  const hasName = nameValue.trim().length > 0;
  const canSubmit = hasName && !isLoading && !isError;

  const ctaHelper = isError
    ? "Couldn't save your name, check your connection and try again"
    : !hasName
      ? 'Enter your name to continue'
      : undefined;
  const progressConfig = useAuthRouteProgress();

  const resolvedFooterLabel = footerLabel ?? (isLoading ? 'Adding…' : 'Add my name');

  return (
    <AuthStepShell
      progressConfig={progressConfig}
      title={title}
      description={description}
      footerLabel={resolvedFooterLabel}
      footerLoading={isLoading}
      footerDisabled={!canSubmit}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      ctaHelper={ctaHelper}
      variant={isError ? 'error' : 'default'}
      contentGap="name"
    >
      <AlTextField
        className="ob-auth-name-field"
        prefix=""
        aria-label="Your name"
        placeholder="Your name"
        value={nameValue}
        onChange={
          onNameChange
            ? (event) => {
                onNameChange(event.target.value);
              }
            : undefined
        }
        state={isError ? 'error' : 'default'}
        disabled={isLoading}
        autoComplete="name"
        aria-invalid={isError || undefined}
      />
    </AuthStepShell>
  );
}
