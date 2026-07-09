import { AlText } from '@autolokate/ui';

import './al-sms-fallback.css';

export type AlSmsFallbackProps = {
  onSmsClick?: () => void;
  disabled?: boolean;
};

/** Figma AlSmsFallback — 649:2068 */
export function AlSmsFallback({ onSmsClick, disabled = false }: AlSmsFallbackProps) {
  return (
    <AlText variant="caption" tone="muted" className="ob-sms-fallback">
      Didn&apos;t get the code?{' '}
      <button type="button" className="ob-sms-fallback__link" onClick={onSmsClick} disabled={disabled}>
        Get it by SMS
      </button>
    </AlText>
  );
}
