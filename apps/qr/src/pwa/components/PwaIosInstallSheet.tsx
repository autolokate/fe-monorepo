import { AlButton, AlPermissionSheet } from '@autolokate/ui';

import { isIosChrome, isIosEdge } from '../device-detection';
import {
  readPwaInstallDismissedRecently,
  writePwaInstallDismissedAt,
} from '../install-dismiss-storage';

import './PwaIosInstallSheet.css';

type PwaIosInstallSheetProps = {
  open: boolean;
  onDismiss: () => void;
};

export function shouldShowIosInstallSheet(): boolean {
  return !readPwaInstallDismissedRecently();
}

export function dismissIosInstallSheet(): void {
  writePwaInstallDismissedAt();
}

function getIosNonSafariInstallCopy(): { title: string; description: string } {
  if (isIosChrome()) {
    return {
      title: 'Install on your iPhone',
      description:
        'Chrome on iPhone cannot install apps directly. Open this page in Safari, then add Autolokate to your home screen.',
    };
  }
  if (isIosEdge()) {
    return {
      title: 'Install on your iPhone',
      description:
        'Edge on iPhone cannot install apps directly. Open this page in Safari, then add Autolokate to your home screen.',
    };
  }
  return {
    title: 'Install on your iPhone',
    description:
      'This browser on iPhone cannot install apps directly. Open this page in Safari, then add Autolokate to your home screen.',
  };
}

/** iOS Chrome / Edge — must open in Safari to install. */
export function PwaIosInstallSheet({ open, onDismiss }: PwaIosInstallSheetProps) {
  const copy = getIosNonSafariInstallCopy();

  return (
    <AlPermissionSheet
      open={open}
      title={copy.title}
      description={copy.description}
      primaryLabel="Got it"
      onPrimary={onDismiss}
      secondaryLabel="Not now"
      onSecondary={onDismiss}
      onDismiss={onDismiss}
    >
      <ol className="pwa-ios-install-sheet__steps">
        <li>
          Open this page in <strong>Safari</strong>
        </li>
        <li>
          Tap <strong>Share</strong>
        </li>
        <li>
          Tap <strong>Add to Home Screen</strong>
        </li>
      </ol>
    </AlPermissionSheet>
  );
}

type PwaIosSafariInstallBannerProps = {
  onDismiss: () => void;
};

/** iOS Safari — Add to Home Screen guidance. */
export function PwaIosSafariInstallBanner({ onDismiss }: PwaIosSafariInstallBannerProps) {
  return (
    <section className="pwa-ios-safari-banner" aria-label="Install Autolokate">
      <div className="pwa-ios-safari-banner__copy">
        <p className="pwa-ios-safari-banner__title">Add to Home Screen</p>
        <p className="pwa-ios-safari-banner__description">
          Tap Share, then &quot;Add to Home Screen&quot; for quick SOS access.
        </p>
        <ol className="pwa-ios-safari-banner__steps">
          <li>
            Tap <strong>Share</strong>
          </li>
          <li>
            Tap <strong>Add to Home Screen</strong>
          </li>
        </ol>
      </div>
      <div className="pwa-ios-safari-banner__actions">
        <AlButton size="sm" variant="primary" onClick={onDismiss}>
          Got it
        </AlButton>
        <button type="button" className="pwa-ios-safari-banner__dismiss" onClick={onDismiss}>
          Not now
        </button>
      </div>
    </section>
  );
}
