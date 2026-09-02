import { AlInput } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

function renderInputState(state: ShowcaseState) {
  const disabled = state === 'disabled';
  const variant = state === 'active' ? 'error' : 'default';

  return (
    <AlInput
      label="Full name"
      placeholder="Kapil Sharma"
      disabled={disabled}
      variant={variant}
      errorText={variant === 'error' ? 'Name is required' : undefined}
    />
  );
}

export function AlInputPage() {
  return (
    <CoreComponentShowcase
      name="AlInput"
      description="Standard labeled text input with validation states."
      whenToUse="General single-line text capture in forms."
      whenNotToUse="Whitelist-only flows that require AlTextField semantics."
      overview={<p>Base input primitive built on the shared field layout and tokens.</p>}
      variants={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlInput label="Default" placeholder="Type here" />
          <AlInput label="Success" variant="success" defaultValue="Saved" />
          <AlInput label="Error" variant="error" errorText="Required" />
        </div>
      }
      sizes={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlInput label="Standard" />
          <AlInput label="Mono" mono defaultValue="ABC-123" />
        </div>
      }
      renderStatePreview={renderInputState}
      usage={<AlInput label="Email" type="email" placeholder="you@example.com" />}
      code={`import { AlInput } from '@autolokate/ui';

<AlInput
  label="Full name"
  placeholder="Enter your name"
  helperText="Shown on your profile"
/>`}
      props={[
        { name: 'label', type: 'string', description: 'Field label.' },
        {
          name: 'variant',
          type: 'AlInputVariant',
          defaultValue: 'default',
          description: 'Visual state.',
        },
        { name: 'trailing', type: 'ReactNode', description: 'Trailing adornment.' },
        { name: 'mono', type: 'boolean', defaultValue: 'false', description: 'Monospace styling.' },
      ]}
    />
  );
}
