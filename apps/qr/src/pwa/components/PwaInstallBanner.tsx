import { AlButton } from '@autolokate/ui';

import './PwaInstallBanner.css';

type PwaInstallBannerProps = {
  onInstall: () => Promise<boolean>;
  onDismiss: () => void;
};

/** Android Chrome install CTA — fixed dock on flow entry when installable. */
export function PwaInstallBanner({ onInstall, onDismiss }: PwaInstallBannerProps) {
  return (
    <section className="pwa-install-banner" aria-label="Install Autolokate">
      <div className="pwa-install-banner__copy">
        <p className="pwa-install-banner__title">Install Autolokate</p>
        <p className="pwa-install-banner__description">
          Add to your home screen for quick SOS and Park Me access.
        </p>
      </div>
      <div className="pwa-install-banner__actions">
        <AlButton
          size="sm"
          variant="primary"
          onClick={() => {
            void onInstall();
          }}
        >
          Install
        </AlButton>
        <button type="button" className="pwa-install-banner__dismiss" onClick={onDismiss}>
          Not now
        </button>
      </div>
    </section>
  );
}
