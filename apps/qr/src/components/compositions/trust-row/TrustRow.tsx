import { AlIcon } from '@autolokate/icons';
import { AlText } from '@autolokate/ui';

import './trust-row.css';

export type TrustRowProps = {
  text?: string;
  /** Figma R03 layout_10R766 — hug width, start-aligned in column. */
  align?: 'start' | 'center';
};

/** Figma Mobile trust row — shield-check + caption */
export function TrustRow({
  text = 'Encrypted at rest · never sold to third parties',
  align = 'center',
}: TrustRowProps) {
  return (
    <div className={`ob-trust-row ob-trust-row--${align}`}>
      <span className="ob-trust-row__icon" aria-hidden>
        <AlIcon name="shield-check" size={16} />
      </span>
      <AlText variant="caption" tone="muted">
        {text}
      </AlText>
    </div>
  );
}
