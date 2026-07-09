import { AlTextField } from '@autolokate/ui';

import { FormFieldStack } from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import { MOBILE_INPUT_DISPLAY_MAX } from '@/features/shared-auth/auth-flow/auth-flow.validation';
import type { EmergencyMobileState, EmergencyScreenNavigationProps } from '../../types';

import '../../../../components/auth-step-shell/auth-step-shell.css';

export type E02RiderMobileScreenProps = EmergencyScreenNavigationProps & {
  mobileState?: EmergencyMobileState;
  mobileValue?: string;
  onMobileChange?: (mobile: string) => void;
};

/** R1 · Rider mobile — Figma 789:2064 */
export function E02RiderMobileScreen({
  mobileState = 'default',
  mobileValue,
  onMobileChange,
  onContinue,
  onBack,
  showBack = true,
}: E02RiderMobileScreenProps) {
  const isError = mobileState === 'error';
  const isOffline = mobileState === 'offline';
  const interactive = mobileValue !== undefined && onMobileChange !== undefined;
  const resolvedMobile = interactive ? mobileValue : '';
  const hasMobile = resolvedMobile.replace(/\D/g, '').length > 0;

  return (
    <FlowStepShell
      phase="emergency"
      step={2}
      title="Rider’s mobile number"
      description="We’ll send them a code on WhatsApp. Enter it here to confirm."
      footerLabel="Get OTP"
      footerDisabled={isOffline || (interactive && !hasMobile)}
      captureProgress={{ step: 1, total: 3 }}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <FormFieldStack>
        <AlTextField
          className="ob-auth-mobile-field"
          aria-label="Mobile number"
          value={interactive ? mobileValue : undefined}
          defaultValue={interactive ? undefined : ''}
          onChange={
            onMobileChange
              ? (event) => {
                  onMobileChange(event.target.value);
                }
              : undefined
          }
          prefix="+91"
          placeholder="Mobile number"
          state={isError ? 'error' : 'default'}
          aria-describedby={isError ? 'e02-mobile-error' : isOffline ? 'e02-mobile-offline' : undefined}
          disabled={isOffline}
          inputMode="numeric"
          autoComplete="tel"
          maxLength={MOBILE_INPUT_DISPLAY_MAX}
        />
        {isError ? (
          <p id="e02-mobile-error" className="ob-field-validation-error" role="alert">
            Enter a valid 10-digit mobile number.
          </p>
        ) : null}
        {isOffline ? (
          <p id="e02-mobile-offline" className="ob-field-validation-error" role="status">
            No internet connection
          </p>
        ) : null}
      </FormFieldStack>
    </FlowStepShell>
  );
}
