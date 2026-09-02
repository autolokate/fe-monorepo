import { AlText } from '@autolokate/ui';

import './al-offline-chip.css';

export type AlOfflineChipProps = {
  text?: string;
};

/** Figma AlOfflineChip — 580:1743 */
export function AlOfflineChip({ text = "You're offline, we'll retry" }: AlOfflineChipProps) {
  return (
    <div className="ob-offline-chip" role="status">
      <span className="ob-offline-chip__dot" aria-hidden />
      <AlText variant="caption">{text}</AlText>
    </div>
  );
}
