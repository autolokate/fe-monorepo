import { AlStatusBar } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

function renderStatusBarState(state: ShowcaseState) {
  const time = state === 'loading' ? '18:05' : '9:41';

  return <AlStatusBar time={time} />;
}

export function StatusBarPage() {
  return (
    <CoreComponentShowcase
      name="AlStatusBar"
      description="Decorative mobile status bar for device-frame previews."
      whenToUse="Storybook-style phone mockups and marketing screenshots."
      whenNotToUse="Production app chrome — use platform status APIs."
      overview={
        <p>
          Lightweight time display with default signal and battery glyphs. Pass custom{' '}
          <code>icons</code> to override.
        </p>
      }
      variants={
        <div className="preview-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <AlStatusBar time="9:41" />
          <AlStatusBar time="18:05" />
        </div>
      }
      renderStatePreview={renderStatusBarState}
      usage={<AlStatusBar time="9:41" />}
      code={`import { AlStatusBar } from '@autolokate/ui';

<AlStatusBar time="9:41" />`}
      props={[
        { name: 'time', type: 'string', description: 'Displayed clock value.' },
        { name: 'icons', type: 'ReactNode', description: 'Custom trailing status icons.' },
      ]}
    />
  );
}
