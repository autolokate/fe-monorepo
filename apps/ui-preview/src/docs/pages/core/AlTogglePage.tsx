import { useState } from 'react';
import { AlToggle } from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';

function ToggleStatePreview({ state }: { state: ShowcaseState }) {
  const [checked, setChecked] = useState(state === 'active' || state === 'loading');

  return (
    <AlToggle
      label="Crash detection"
      helperText="Notify emergency contacts automatically"
      checked={checked}
      disabled={state === 'disabled'}
      loading={state === 'loading'}
      onChange={(event) => {
        setChecked(event.target.checked);
      }}
    />
  );
}

function renderToggleState(state: ShowcaseState) {
  return <ToggleStatePreview state={state} />;
}

export function AlTogglePage() {
  const [enabled, setEnabled] = useState(true);

  return (
    <CoreComponentShowcase
      name="AlToggle"
      description="Binary on/off control for settings and preferences."
      whenToUse="Immediate settings that take effect without a separate save action."
      whenNotToUse="Multi-option choices — use chips or radio groups."
      overview={<p>Figma Core toggle with label, optional helper, loading, and 48dp touch target.</p>}
      variants={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlToggle label="Off" checked={false} onChange={() => undefined} />
          <AlToggle label="On" checked helperText="Enabled" onChange={() => undefined} />
          <AlToggle label="Loading" checked loading onChange={() => undefined} />
          <AlToggle label="Disabled" checked={false} disabled onChange={() => undefined} />
        </div>
      }
      renderStatePreview={renderToggleState}
      usage={
        <AlToggle
          label="Family coverage"
          helperText="Include riders on this plan"
          checked={enabled}
          onChange={(event) => {
            setEnabled(event.target.checked);
          }}
        />
      }
      code={`import { AlToggle } from '@autolokate/ui';

<AlToggle
  label="Crash detection"
  helperText="Automatic emergency alerts"
  checked={enabled}
  onChange={(event) => setEnabled(event.target.checked)}
/>`}
      props={[
        { name: 'label', type: 'string', description: 'Visible toggle label.' },
        { name: 'helperText', type: 'string', description: 'Supporting description.' },
        { name: 'checked', type: 'boolean', description: 'Controlled on state.' },
        { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Shows busy state.' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables control.' },
      ]}
    />
  );
}
