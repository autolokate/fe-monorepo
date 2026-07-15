import { AlIcon } from '@autolokate/icons';
import { AlQuickAction } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

function renderQuickActionState(state: ShowcaseState) {
  return (
    <AlQuickAction
      label="Scan QR"
      icon={<AlIcon name="scan-line" size={20} aria-hidden />}
      loading={state === 'loading'}
      disabled={state === 'disabled'}
    />
  );
}

export function AlQuickActionPage() {
  return (
    <CoreComponentShowcase
      name="AlQuickAction"
      description="Icon-forward shortcut tile for home and hub actions."
      whenToUse="Secondary actions on dashboards and tool grids."
      whenNotToUse="Primary CTAs — use AlButton."
      overview={<p>Vertical icon + label pattern with loading state.</p>}
      variants={
        <div className="preview-row">
          <AlQuickAction label="Scan" icon={<AlIcon name="scan-line" size={20} aria-hidden />} />
          <AlQuickAction
            label="Parking"
            icon={<AlIcon name="square-parking" size={20} aria-hidden />}
          />
          <AlQuickAction
            label="Wallet"
            icon={<AlIcon name="credit-card" size={20} aria-hidden />}
          />
        </div>
      }
      renderStatePreview={renderQuickActionState}
      usage={
        <div className="preview-row">
          <AlQuickAction
            label="Parking"
            icon={<AlIcon name="square-parking" size={20} aria-hidden />}
          />
          <AlQuickAction
            label="Receipts"
            icon={<AlIcon name="receipt-text" size={20} aria-hidden />}
          />
          <AlQuickAction label="Community" icon={<AlIcon name="users" size={20} aria-hidden />} />
        </div>
      }
      code={`import { AlQuickAction } from '@autolokate/ui';
import { AlIcon } from '@autolokate/icons';

<AlQuickAction
  label="Scan QR"
  icon={<AlIcon name="scan-line" size={20} aria-hidden />}
  onClick={openScanner}
/>`}
      props={[
        { name: 'label', type: 'string', description: 'Caption below icon.' },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
        {
          name: 'loading',
          type: 'boolean',
          defaultValue: 'false',
          description: 'Shows spinner in icon slot.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          defaultValue: 'false',
          description: 'Disables action.',
        },
      ]}
    />
  );
}
