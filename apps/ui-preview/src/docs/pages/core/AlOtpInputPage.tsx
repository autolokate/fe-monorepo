import { useEffect, useRef, useState } from 'react';
import { AlHeading, AlOtpInput, AlStack, AlText } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

import './al-otp-input-page.css';

const OTP_STATE_MATRIX = [
  {
    id: 'empty',
    label: 'Empty',
    figmaNode: '101:26',
    value: '',
    state: 'empty' as const,
    focusIndex: 0,
  },
  {
    id: 'focused',
    label: 'Focused',
    figmaNode: '75:19',
    value: '472',
    state: 'empty' as const,
    focusIndex: 3,
  },
  {
    id: 'filled',
    label: 'Filled',
    figmaNode: '552:2502',
    value: '472918',
    state: 'filled' as const,
  },
  {
    id: 'success',
    label: 'Success',
    figmaNode: '101:46',
    value: '472918',
    state: 'success' as const,
  },
  {
    id: 'error',
    label: 'Error',
    figmaNode: '101:33',
    value: '472918',
    state: 'error' as const,
    errorText: 'Incorrect code',
  },
  {
    id: 'disabled',
    label: 'Disabled',
    figmaNode: '75:19',
    value: '472918',
    state: 'filled' as const,
    disabled: true,
  },
] as const;

function OtpMatrixItem({ item }: { item: (typeof OTP_STATE_MATRIX)[number] }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!('focusIndex' in item)) {
      return;
    }
    const cells = wrapRef.current?.querySelectorAll<HTMLInputElement>('.al-otp-input__cell');
    cells?.[item.focusIndex]?.focus();
  }, [item]);

  return (
    <div className="ds-otp-state-matrix__item">
      <AlText variant="label">{item.label}</AlText>
      <AlText variant="caption" tone="muted">
        Figma {item.figmaNode}
      </AlText>
      <div ref={wrapRef}>
        <AlOtpInput
          length={6}
          value={item.value}
          onChange={() => undefined}
          state={item.state}
          errorText={'errorText' in item ? item.errorText : undefined}
          disabled={'disabled' in item ? item.disabled : false}
        />
      </div>
    </div>
  );
}

function OtpStateMatrixPreview({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className={`ds-otp-state-matrix ds-otp-state-matrix--${theme}`} data-theme={theme}>
      {OTP_STATE_MATRIX.map((item) => (
        <OtpMatrixItem key={`${theme}-${item.id}`} item={item} />
      ))}
    </div>
  );
}

function OtpStatePreview({ state }: { state: ShowcaseState }) {
  const [value, setValue] = useState(state === 'loading' ? '482910' : '');

  return (
    <AlOtpInput
      label="Enter OTP"
      length={6}
      value={value}
      onChange={setValue}
      disabled={state === 'disabled'}
      loading={state === 'loading'}
      state={
        state === 'error'
          ? 'error'
          : state === 'success'
            ? 'success'
            : state === 'active'
              ? 'filled'
              : 'empty'
      }
      errorText={state === 'error' ? 'Incorrect code' : undefined}
      helperText={state === 'default' ? 'Sent to your mobile' : undefined}
    />
  );
}

function renderOtpState(state: ShowcaseState) {
  return <OtpStatePreview state={state} />;
}

export function AlOtpInputPage() {
  const [usageValue, setUsageValue] = useState('');

  return (
    <AlStack gap="lg">
      <CoreComponentShowcase
        name="AlOtpInput"
        description="Segmented OTP entry with autofill, paste, and numeric keyboard."
        whenToUse="Mobile verification and one-time code flows."
        whenNotToUse="Non-numeric secrets or passwords."
        overview={
          <p>
            Figma-aligned OTP cells: empty/focused use 1–2px outline; filled, success, and error use
            2px semantic borders. Error state uses <code>--al-color-warning</code> (amber), not
            danger red.
          </p>
        }
        variants={
          <AlOtpInput
            label="6-digit OTP"
            length={6}
            value="123456"
            onChange={() => undefined}
            state="filled"
          />
        }
        sizes={
          <div className="preview-row">
            <AlOtpInput
              label="4-digit"
              length={4}
              value="1234"
              onChange={() => undefined}
              state="filled"
            />
            <AlOtpInput
              label="6-digit"
              length={6}
              value="123456"
              onChange={() => undefined}
              state="filled"
            />
          </div>
        }
        renderStatePreview={renderOtpState}
        usage={
          <AlOtpInput
            label="Verify mobile"
            length={6}
            value={usageValue}
            onChange={setUsageValue}
            helperText="Enter the 6-digit code"
          />
        }
        code={`import { AlOtpInput } from '@autolokate/ui';

const [otp, setOtp] = useState('');

<AlOtpInput
  label="Enter OTP"
  length={6}
  value={otp}
  onChange={setOtp}
  state="error"
  errorText="Incorrect code"
/>`}
        props={[
          { name: 'length', type: 'number', defaultValue: '6', description: 'Number of digits.' },
          { name: 'value', type: 'string', description: 'Controlled OTP string.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Change handler.' },
          {
            name: 'state',
            type: 'AlOtpInputState',
            defaultValue: 'empty',
            description: 'empty | filled | error | success',
          },
          { name: 'errorText', type: 'string', description: 'Inline error message.' },
          {
            name: 'loading',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Disables cells and shows busy.',
          },
        ]}
      />

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">OTP state matrix · Light theme</AlHeading>
        <AlText tone="muted">
          Explicit Figma variants — empty, focused, filled, success, error, disabled.
        </AlText>
        <OtpStateMatrixPreview theme="light" />
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">OTP state matrix · Dark theme</AlHeading>
        <OtpStateMatrixPreview theme="dark" />
      </section>
    </AlStack>
  );
}
