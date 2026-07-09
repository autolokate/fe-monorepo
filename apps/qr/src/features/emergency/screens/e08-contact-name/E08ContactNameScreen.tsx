import { AlTextField } from '@autolokate/ui';

import { FormFieldStack, RelationshipSelector } from '@/components/compositions/index.js';
import { FlowStepShell } from '@/components/flow-step-shell/index.js';
import type { EmergencyNameFormState, EmergencyScreenNavigationProps, RelationshipId } from '../../types.js';

import '../../../../components/auth-step-shell/auth-step-shell.css';
import '../../emergency.css';

export type E08ContactNameScreenProps = EmergencyScreenNavigationProps & {
  nameValue?: string;
  onNameChange?: (name: string) => void;
  relation?: RelationshipId;
  onRelationChange?: (relation: RelationshipId) => void;
  formState?: EmergencyNameFormState;
};

/** E3 · Contact name — Figma 371:1276 */
export function E08ContactNameScreen({
  nameValue = '',
  onNameChange,
  relation,
  onRelationChange,
  formState = 'default',
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

  return (
    <FlowStepShell
      phase="emergency"
      step={8}
      title="Add this contact"
      description="Add their name and how they’re related"
      footerLabel="Save contact"
      footerLoading={isSubmitting}
      footerDisabled={isInvalid || isSubmitting}
      footerHelperText={
        isError
          ? 'We couldn’t save contact details'
          : showDisabledHelper
            ? 'Add a name to continue'
            : undefined
      }
      footerHelperTone={isError ? 'warning' : 'muted'}
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
          disabled={!interactive || isSubmitting}
        />
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
