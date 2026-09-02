import { AlTextField } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

function renderTextFieldState(state: ShowcaseState) {
  const disabled = state === 'disabled';
  const fieldState = state === 'active' ? 'error' : state === 'loading' ? 'success' : 'default';

  return (
    <AlTextField
      label="Mobile number"
      placeholder="98765 43210"
      disabled={disabled}
      loading={state === 'loading'}
      state={fieldState}
      errorText={fieldState === 'error' ? 'Enter a valid number' : undefined}
      helperText={fieldState === 'default' ? 'OTP will be sent here' : undefined}
      defaultValue={state === 'loading' ? '9876543210' : undefined}
    />
  );
}

export function AlTextFieldPage() {
  return (
    <CoreComponentShowcase
      name="AlTextField"
      description="Whitelist text entry with prefix, loading, and validation states."
      whenToUse="Mobile number, OTP fallback, and other approved whitelist inputs."
      whenNotToUse="Default for general forms — prefer tap-first flows."
      overview={
        <p>
          Figma Core text field with label, optional +91 prefix, helper, inline error, and loading
          spinner.
        </p>
      }
      variants={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlTextField label="Default" placeholder="Enter value" />
          <AlTextField label="Success" state="success" defaultValue="Verified" />
          <AlTextField label="Error" state="error" errorText="Invalid code" />
          <AlTextField label="Disabled" state="disabled" defaultValue="Read only" />
        </div>
      }
      sizes={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlTextField label="With prefix" prefix="+91" placeholder="Mobile" />
          <AlTextField label="No prefix" prefix="" placeholder="Custom prefix slot" />
        </div>
      }
      renderStatePreview={renderTextFieldState}
      usage={
        <AlTextField
          label="Mobile number"
          prefix="+91"
          inputMode="numeric"
          placeholder="98765 43210"
        />
      }
      code={`import { AlTextField } from '@autolokate/ui';

<AlTextField
  label="Mobile number"
  prefix="+91"
  placeholder="98765 43210"
  helperText="OTP will be sent here"
/>`}
      props={[
        { name: 'label', type: 'string', description: 'Field label.' },
        {
          name: 'state',
          type: 'AlTextFieldState',
          defaultValue: 'default',
          description: 'Visual state.',
        },
        {
          name: 'prefix',
          type: 'ReactNode',
          defaultValue: '+91',
          description: 'Leading prefix slot.',
        },
        { name: 'helperText', type: 'string', description: 'Hint below control.' },
        { name: 'errorText', type: 'string', description: 'Inline error message.' },
        { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Shows spinner.' },
      ]}
    />
  );
}
