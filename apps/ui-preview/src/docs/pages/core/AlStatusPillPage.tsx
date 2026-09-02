import { AlStatusPill } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

function renderStatusPillState(state: ShowcaseState) {
  const variant = state === 'active' ? 'attention' : state === 'loading' ? 'alert' : 'protected';

  return <AlStatusPill label={state === 'loading' ? 'Syncing…' : 'Protected'} variant={variant} />;
}

export function AlStatusPillPage() {
  return (
    <CoreComponentShowcase
      name="AlStatusPill"
      description="Signal-colored status chip with dot and label for accessibility."
      whenToUse="Use for live protection, verification, and lifecycle states."
      whenNotToUse="Do not use color alone without label."
      overview={
        <p>
          Maps product state to signal colors: protected, attention, and alert — each with a dot
          indicator plus text.
        </p>
      }
      variants={
        <div className="preview-row">
          <AlStatusPill label="Protected" variant="protected" />
          <AlStatusPill label="Pending" variant="attention" />
          <AlStatusPill label="Expired" variant="alert" />
        </div>
      }
      renderStatePreview={renderStatusPillState}
      usage={<AlStatusPill label="Crash detection active" variant="protected" />}
      code={`import { AlStatusPill } from '@autolokate/ui';

<AlStatusPill label="Protected" variant="protected" />`}
      props={[
        { name: 'label', type: 'string', description: 'Visible status text.' },
        {
          name: 'variant',
          type: 'AlStatusPillVariant',
          description: 'protected | attention | alert',
        },
      ]}
    />
  );
}
