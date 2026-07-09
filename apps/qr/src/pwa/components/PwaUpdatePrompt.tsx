import { AlButton } from '@autolokate/ui';

import { usePwaUpdate } from '../use-pwa-update.js';

import './PwaUpdatePrompt.css';

/** Prompts user when a new service worker version is ready. */
export function PwaUpdatePrompt() {
  const { updateAvailable, applyUpdate, dismissUpdate } = usePwaUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <section className="pwa-update-prompt" role="status" aria-live="polite">
      <p className="pwa-update-prompt__copy">A new version of Autolokate is ready.</p>
      <div className="pwa-update-prompt__actions">
        <AlButton
          size="sm"
          variant="primary"
          onClick={() => {
            void applyUpdate();
          }}
        >
          Update
        </AlButton>
        <button type="button" className="pwa-update-prompt__dismiss" onClick={dismissUpdate}>
          Later
        </button>
      </div>
    </section>
  );
}
