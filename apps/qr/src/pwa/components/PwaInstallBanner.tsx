import { AlButton } from '@autolokate/ui';

import { usePwaInstall } from '../use-pwa-install.js';

import './PwaInstallBanner.css';

/** Android Chrome install CTA — shown on flow entry when installable. */
export function PwaInstallBanner() {
  const { canPrompt, promptInstall, dismissPrompt } = usePwaInstall();

  if (!canPrompt) {
    return null;
  }

  return (
    <section className="pwa-install-banner" aria-label="Install Autolokate">
      <div className="pwa-install-banner__copy">
        <p className="pwa-install-banner__title">Install Autolokate</p>
        <p className="pwa-install-banner__description">Add to your home screen for quick SOS and Park Me access.</p>
      </div>
      <div className="pwa-install-banner__actions">
        <AlButton
          size="sm"
          variant="primary"
          onClick={() => {
            void promptInstall();
          }}
        >
          Install
        </AlButton>
        <button type="button" className="pwa-install-banner__dismiss" onClick={dismissPrompt}>
          Not now
        </button>
      </div>
    </section>
  );
}
