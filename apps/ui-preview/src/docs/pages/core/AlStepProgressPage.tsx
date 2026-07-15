import { AlStepProgress } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

function renderStepProgressState(state: ShowcaseState) {
  const step = state === 'loading' ? 5 : state === 'active' ? 3 : state === 'disabled' ? 1 : 2;

  return <AlStepProgress step={step} total={5} />;
}

export function AlStepProgressPage() {
  return (
    <CoreComponentShowcase
      name="AlStepProgress"
      description="Segmented horizontal progress for multi-step flows."
      whenToUse="Onboarding, checkout, and verification wizards."
      whenNotToUse="Detailed step copy with descriptions — use a stepper with labels."
      overview={
        <p>
          Figma default is a 361×6 track with 4px segments, 6px gap, 2px radius. Complete segments
          are white; incomplete are neutral-700.
        </p>
      }
      variants={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlStepProgress step={1} total={3} />
          <AlStepProgress step={3} total={3} />
        </div>
      }
      sizes={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlStepProgress step={2} total={3} />
          <AlStepProgress step={2} total={5} />
          <AlStepProgress step={2} total={5} label="Checkout" showMeta />
        </div>
      }
      renderStatePreview={renderStepProgressState}
      usage={<AlStepProgress step={2} total={4} />}
      code={`import { AlStepProgress } from '@autolokate/ui';

<AlStepProgress step={2} total={4} />
<AlStepProgress step={2} total={4} label="Vehicle setup" showMeta />`}
      props={[
        { name: 'step', type: 'number', description: 'Current step (1-based).' },
        { name: 'total', type: 'number', defaultValue: '5', description: 'Total segments.' },
        {
          name: 'label',
          type: 'string',
          description: 'Optional progress label (requires showMeta).',
        },
        {
          name: 'showMeta',
          type: 'boolean',
          defaultValue: 'false',
          description: 'Renders label + step count above the track.',
        },
      ]}
    />
  );
}
