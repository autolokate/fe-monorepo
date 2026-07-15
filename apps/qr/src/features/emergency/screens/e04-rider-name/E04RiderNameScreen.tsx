import { AlTextField } from '@autolokate/ui';

import { FormFieldStack, RelationshipSelector } from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import type {
  EmergencyNameFormState,
  EmergencyScreenNavigationProps,
  RelationshipId,
} from '../../types';

import '../../../../components/auth-step-shell/auth-step-shell.css';
import '../../emergency.css';

export type E04RiderNameScreenProps = EmergencyScreenNavigationProps & {
  nameValue?: string;
  onNameChange?: (name: string) => void;
  relation?: RelationshipId;
  onRelationChange?: (relation: RelationshipId) => void;
  formState?: EmergencyNameFormState;
  /** API error message — shown only when the backend returned a message. */
  errorMessage?: string | null;
};

/** R3 · Rider name — Figma 374:71 */
export function E04RiderNameScreen({
  nameValue = '',
  onNameChange,
  relation,
  onRelationChange,
  formState = 'default',
  errorMessage = null,
  onContinue,
  onBack,
  showBack = true,
}: E04RiderNameScreenProps) {
  const interactive = onNameChange !== undefined;
  const isSubmitting = formState === 'submitting';
  const isError = formState === 'error';
  const hasName = nameValue.trim().length > 0;
  const isInvalid = interactive && (!hasName || !relation);
  const showDisabledHelper = isInvalid && !isSubmitting && !isError;
  const fieldError = isError ? errorMessage?.trim() || null : null;

  return (
    <FlowStepShell
      phase="emergency"
      step={4}
      title="Add this rider"
      description="Add their name and how they’re related"
      footerLabel="Save rider"
      footerLoading={isSubmitting}
      footerDisabled={isInvalid || isSubmitting}
      footerHelperText={showDisabledHelper ? 'Add a name to continue' : undefined}
      footerHelperTone="muted"
      captureProgress={{ step: 3, total: 3 }}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <FormFieldStack className="ob-emergency-name-form">
        <AlTextField
          className="ob-auth-name-field"
          prefix=""
          aria-label="Rider name"
          value={nameValue}
          onChange={
            onNameChange
              ? (event) => {
                  onNameChange(event.target.value);
                }
              : undefined
          }
          state={fieldError ? 'error' : 'default'}
          disabled={!interactive || isSubmitting}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? 'e04-name-error' : undefined}
        />
        {fieldError ? (
          <p id="e04-name-error" className="ob-field-validation-error" role="alert">
            {fieldError}
          </p>
        ) : null}
        <RelationshipSelector
          variant="contact"
          value={relation}
          onChange={onRelationChange}
          disabled={!interactive || isSubmitting}
        />
      </FormFieldStack>
    </FlowStepShell>
  );
}
