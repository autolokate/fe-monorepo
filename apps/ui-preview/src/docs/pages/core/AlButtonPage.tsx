import { AlButton } from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';

function renderButtonState(state: ShowcaseState) {
  const loading = state === 'loading';
  const disabled = state === 'disabled';

  if (state === 'hover' || state === 'pressed' || state === 'focus' || state === 'active') {
    return (
      <AlButton variant="primary" data-showcase-simulated={state}>
        Continue
      </AlButton>
    );
  }

  return (
    <AlButton variant="primary" loading={loading} disabled={disabled}>
      {loading ? 'Loading' : 'Continue'}
    </AlButton>
  );
}

function renderButtonVariants() {
  return (
    <div className="preview-row" style={{ flexWrap: 'wrap' }}>
      <AlButton variant="primary">Activate sticker</AlButton>
      <AlButton variant="secondary">Not now</AlButton>
      <AlButton variant="destructive">I need help</AlButton>
      <AlButton variant="primary" loading>
        Loading
      </AlButton>
      <AlButton variant="primary" disabled>
        Continue
      </AlButton>
    </div>
  );
}

export function AlButtonPage() {
  return (
    <CoreComponentShowcase
      name="AlButton"
      description="Primary product action — 320×58, 16px Inter semibold, 16px radius."
      whenToUse="Primary, secondary, and destructive actions in consumer flows."
      whenNotToUse="Do not use as inline text navigation."
      overview={
        <p>
          Figma specs: 58px height, 24px horizontal padding, 16px/600 Inter label, 20px line-height.
          Loading uses a 20px spinner with 2.5px stroke. Disabled uses neutral-700 fill and
          muted label.
        </p>
      }
      variants={renderButtonVariants()}
      renderStatePreview={renderButtonState}
      usage={<AlButton variant="primary">Activate sticker</AlButton>}
      code={`import { AlButton } from '@autolokate/ui';

<AlButton variant="primary">Activate sticker</AlButton>
<AlButton variant="secondary">Not now</AlButton>
<AlButton variant="destructive">I need help</AlButton>
<AlButton variant="primary" loading />
<AlButton variant="primary" disabled>Continue</AlButton>`}
      props={[
        { name: 'variant', type: 'AlButtonVariant', defaultValue: 'primary', description: 'primary | secondary | destructive | outline | ghost | success' },
        { name: 'size', type: 'AlButtonSize', defaultValue: 'md', description: 'sm | md | lg | icon' },
        { name: 'loading', type: 'boolean', defaultValue: 'false', description: '20px Figma spinner.' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Neutral-700 fill, muted text.' },
      ]}
    />
  );
}
