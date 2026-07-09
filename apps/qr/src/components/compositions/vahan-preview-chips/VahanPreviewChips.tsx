import { AlIcon } from '@autolokate/icons';
import { AlText } from '@autolokate/ui';

import './vahan-preview-chips.css';

const VAHAN_PREVIEW_LABELS = [
  'Make & model',
  'Year',
  'Fuel',
  'Insurance',
  'PUC',
  'Owner name',
] as const;

/** Figma R03/R03b — placeholder chips filled in after Vahan fetch. */
export function VahanPreviewChips() {
  return (
    <section className="ob-vahan-preview" aria-label="Vahan preview fields">
      <AlText variant="caption" tone="muted" className="ob-vahan-preview__label">
        Vahan will fill these in
      </AlText>
      <ul className="ob-vahan-preview__chips">
        {VAHAN_PREVIEW_LABELS.map((label) => (
          <li key={label} className="ob-vahan-preview__chip">
            <AlIcon name="check" size={10} className="ob-vahan-preview__chip-icon" aria-hidden />
            <span className="ob-vahan-preview__chip-label">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
