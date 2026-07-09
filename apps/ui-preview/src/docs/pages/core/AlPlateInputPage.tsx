import { useState } from 'react';
import { AlPlateInput } from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';

function renderPlateInput(state: ShowcaseState, value = 'MH 12 AB 3456') {
  const disabled = state === 'disabled';

  return (
    <AlPlateInput
      value={value}
      disabled={disabled}
      data-showcase-simulated={state === 'focus' || state === 'hover' ? state : undefined}
    />
  );
}

export function AlPlateInputPage() {
  const [value, setValue] = useState('MH 12 AB 3456');

  return (
    <CoreComponentShowcase
      name="AlPlateInput"
      description="Indian vehicle registration plate field — 62px height, Inter 24px/700 uppercase."
      whenToUse="Vehicle registration capture in onboarding and verification flows."
      whenNotToUse="Do not use for generic alphanumeric text — use AlInput or AlTextField."
      overview={
        <p>
          Figma INPUTS row plate control: green divider (#1FA24A), plate surface token, uppercase
          auto-transform on change. Focus ring uses <code className="ds-inline-code">:focus-within</code>{' '}
          on the plate shell. Default aria-label: &quot;Vehicle registration plate&quot;.
        </p>
      }
      variants={
        <div className="preview-row" style={{ flexWrap: 'wrap' }}>
          <AlPlateInput value="MH 12 AB 3456" />
          <AlPlateInput value="" placeholder="MH 12 AB 3456" />
          <AlPlateInput value="MH 12 AB 3456" disabled />
        </div>
      }
      renderStatePreview={(state) => renderPlateInput(state, value)}
      responsive={renderPlateInput('default', 'MH 12 AB 3456')}
      accessibility={
        <ul className="ds-list">
          <li>Native <code className="ds-inline-code">input</code> with configurable aria-label.</li>
          <li>Focus ring on plate container via <code className="ds-inline-code">:focus-within</code>.</li>
          <li>62px height meets 48dp touch target minimum.</li>
          <li>Uppercase transform applied on change for consistent plate formatting.</li>
          <li>Read-only when <code className="ds-inline-code">onChange</code> is omitted.</li>
        </ul>
      }
      usage={
        <AlPlateInput
          value={value}
          onChange={(next) => {
            setValue(next);
          }}
        />
      }
      code={`import { AlPlateInput } from '@autolokate/ui';

<AlPlateInput value="MH 12 AB 3456" onChange={setPlate} />
<AlPlateInput value="MH 12 AB 3456" disabled />
<AlPlateInput value="MH 12 AB 3456" aria-label="Registration number" />`}
      props={[
        { name: 'value', type: 'string', description: 'Plate value (displayed uppercase).' },
        { name: 'onChange', type: '(value: string) => void', description: 'Optional — omit for read-only.' },
        { name: 'placeholder', type: 'string', defaultValue: 'MH 12 AB 3456', description: 'Empty-state hint.' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables input interaction.' },
        { name: 'aria-label', type: 'string', defaultValue: 'Vehicle registration plate', description: 'Screen reader label.' },
      ]}
    />
  );
}
