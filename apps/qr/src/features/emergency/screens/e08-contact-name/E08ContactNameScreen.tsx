import { AlTextField } from '@autolokate/ui';

import { FormFieldStack, RelationshipSelector } from '@/components/compositions/index';
import { FlowStepShell } from '@/components/flow-step-shell/index';
import type { EmergencyNameFormState, EmergencyScreenNavigationProps, RelationshipId } from '../../types';

import '../../../../components/auth-step-shell/auth-step-shell.css';
import '../../emergency.css';

export type E08ContactNameScreenProps = EmergencyScreenNavigationProps & {
  nameValue?: string;
  onNameChange?: (name: string) => void;
  relation?: RelationshipId;
  onRelationChange?: (relation: RelationshipId) => void;
  formState?: EmergencyNameFormState;
  /** API error message — shown only when the backend returned a message. */
  errorMessage?: string | null;
};

/** E3 · Contact name — Figma 371:1276 */
export function E08ContactNameScreen({
  nameValue = '',
  onNameChange,
  relation,
  onRelationChange,
  formState = 'default',
  errorMessage = null,
  onContinue,
  onBack,
  showBack = true,
}: E08ContactNameScreenProps) {
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
      step={8}
      title="Add this contact"
      description="Add their name and how they’re related"
      footerLabel="Save contact"
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
          aria-label="Contact name"
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
          aria-describedby={fieldError ? 'e08-name-error' : undefined}
        />
        {fieldError ? (
          <p id="e08-name-error" className="ob-field-validation-error" role="alert">
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
