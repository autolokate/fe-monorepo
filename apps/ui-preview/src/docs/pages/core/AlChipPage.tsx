import { AlIcon } from '@autolokate/icons';
import { AlChip } from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';

function renderChipState(state: ShowcaseState) {
  const variant = state === 'active' || state === 'loading' ? 'green' : 'neutral';

  return (
    <AlChip
      variant={variant}
      label="Active"
      icon={<AlIcon name="user" size={14} aria-hidden />}
    />
  );
}

export function AlChipPage() {
  return (
    <CoreComponentShowcase
      name="AlChip"
      description="Status chip with semantic dot color — matches Figma AlChip/Green, Amber, Neutral."
      whenToUse="Plan status, verification state, and inline labels."
      whenNotToUse="Interactive filters — use onClick only when a tap action is required."
      overview={<p>Read-only status chip with colored dot and label. Variants map to Figma exactly.</p>}
      variants={
        <div className="preview-row">
          <AlChip variant="green" label="Active" />
          <AlChip variant="amber" label="Pending" />
          <AlChip variant="neutral" label="Label" />
          <AlChip variant="green" label="With icon" icon={<AlIcon name="shield-check" size={14} aria-hidden />} />
        </div>
      }
      renderStatePreview={renderChipState}
      usage={
        <div className="preview-row">
          <AlChip variant="green" label="Protected" />
          <AlChip variant="amber" label="Renew soon" />
          <AlChip variant="neutral" label="Draft" />
        </div>
      }
      code={`import { AlChip } from '@autolokate/ui';

<AlChip variant="green" label="Active" />
<AlChip variant="amber" label="Pending" />
<AlChip variant="neutral" label="Label" />`}
      props={[
        { name: 'variant', type: "'green' | 'amber' | 'neutral'", defaultValue: 'neutral', description: 'Figma chip color variant.' },
        { name: 'label', type: 'string', description: 'Chip label text.' },
        { name: 'icon', type: 'ReactNode', description: 'Optional leading icon.' },
        { name: 'onClick', type: '() => void', description: 'When provided, renders as button.' },
      ]}
    />
  );
}
