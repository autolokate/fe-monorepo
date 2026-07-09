import { AlField } from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';

function renderFieldState(state: ShowcaseState) {
  return (
    <AlField
      label="Vehicle number"
      value={state === 'loading' ? 'MH 12 AB 1234' : '—'}
      tone={state === 'disabled' ? 'muted' : 'default'}
    />
  );
}

export function AlFieldPage() {
  return (
    <CoreComponentShowcase
      name="AlField"
      description="Read-only label/value pair for confirmation and detail rows."
      whenToUse="Vehicle details, receipt rows, and review screens."
      whenNotToUse="Editable input — use AlTextField or AlInput."
      overview={<p>Compact readonly field with default and muted tones.</p>}
      variants={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlField label="Plan" value="Shield" />
          <AlField label="Status" value="Pending verification" tone="muted" />
        </div>
      }
      renderStatePreview={renderFieldState}
      usage={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--al-space-sm)' }}>
          <AlField label="Registration" value="MH 12 AB 1234" />
          <AlField label="Make / Model" value="Maruti Swift" />
        </div>
      }
      code={`import { AlField } from '@autolokate/ui';

<AlField label="Registration" value="MH 12 AB 1234" />`}
      props={[
        { name: 'label', type: 'string', description: 'Field label.' },
        { name: 'value', type: 'ReactNode', description: 'Displayed value.' },
        { name: 'tone', type: "'default' | 'muted'", defaultValue: 'default', description: 'Visual emphasis.' },
      ]}
    />
  );
}
