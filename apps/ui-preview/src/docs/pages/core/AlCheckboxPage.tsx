import { useState } from 'react';
import { AlCheckbox } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

function CheckboxStatePreview({ state }: { state: ShowcaseState }) {
  const [checked, setChecked] = useState(state === 'active');

  return (
    <AlCheckbox
      label="I agree to the terms"
      checked={checked}
      disabled={state === 'disabled'}
      errorText={state === 'focus' ? 'You must accept to continue' : undefined}
      onChange={(event) => {
        setChecked(event.target.checked);
      }}
    />
  );
}

function renderCheckboxState(state: ShowcaseState) {
  return <CheckboxStatePreview state={state} />;
}

export function AlCheckboxPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <CoreComponentShowcase
      name="AlCheckbox"
      description="Multi-select or consent checkbox with label and validation."
      whenToUse="Optional multi-select lists and explicit consent capture."
      whenNotToUse="Single exclusive choices — use chips or radio."
      overview={<p>Accessible checkbox with label, helper, and error slots.</p>}
      variants={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlCheckbox label="Unchecked" checked={false} onChange={() => undefined} />
          <AlCheckbox label="Checked" checked onChange={() => undefined} />
          <AlCheckbox label="With error" errorText="Required" onChange={() => undefined} />
        </div>
      }
      renderStatePreview={renderCheckboxState}
      usage={
        <AlCheckbox
          label="Send me safety updates"
          helperText="Occasional tips, no spam"
          checked={accepted}
          onChange={(event) => {
            setAccepted(event.target.checked);
          }}
        />
      }
      code={`import { AlCheckbox } from '@autolokate/ui';

<AlCheckbox
  label="I agree to the terms"
  checked={accepted}
  onChange={(event) => setAccepted(event.target.checked)}
/>`}
      props={[
        { name: 'label', type: 'string', description: 'Checkbox label.' },
        { name: 'helperText', type: 'string', description: 'Supporting hint.' },
        { name: 'errorText', type: 'string', description: 'Validation message.' },
        {
          name: 'disabled',
          type: 'boolean',
          defaultValue: 'false',
          description: 'Disables input.',
        },
      ]}
    />
  );
}
