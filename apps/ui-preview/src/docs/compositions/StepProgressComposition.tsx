import { AlHeading, AlStack, AlStepProgress, AlText } from '@autolokate/ui';

const steps = [
  { step: 1, label: 'Phone verification' },
  { step: 2, label: 'Vehicle setup' },
  { step: 3, label: 'Plan selection' },
  { step: 4, label: 'Emergency contacts' },
  { step: 5, label: 'Review & confirm' },
] as const;

export function StepProgressComposition() {
  return (
    <AlStack gap="lg">
      <AlStack gap="sm">
        <AlHeading variant="h4">Onboarding progress</AlHeading>
        <AlText tone="muted">
          Step states 1 through 5 of 5 from Figma AlStepProgress variants.
        </AlText>
      </AlStack>
      {steps.map(({ step, label }) => (
        <AlStack key={step} gap="sm">
          <AlText variant="caption" tone="muted">
            Step {step} of 5
          </AlText>
          <AlStepProgress step={step} total={5} label={label} showMeta />
        </AlStack>
      ))}
    </AlStack>
  );
}
