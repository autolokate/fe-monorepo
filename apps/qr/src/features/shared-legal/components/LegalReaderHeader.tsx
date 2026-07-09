import { AlIcon } from '@autolokate/icons';
import { AlIconButton } from '@autolokate/ui';

import '../../../components/step-shell-chrome/step-shell-chrome.css';

export type LegalReaderHeaderProps = {
  onBack?: () => void;
  showBack?: boolean;
};

export function LegalReaderHeader({ onBack, showBack = true }: LegalReaderHeaderProps) {
  return (
    <header className="ob-step-chrome__header ob-step-chrome__header--compact ob-legal-reader__header">
      <AlIconButton
        icon={<AlIcon name="arrow-left" size={24} aria-hidden />}
        label="Go back"
        onClick={onBack}
        disabled={!showBack || !onBack}
        className="ob-step-chrome__back ob-legal-reader__back ob-shell-back"
      />
    </header>
  );
}
