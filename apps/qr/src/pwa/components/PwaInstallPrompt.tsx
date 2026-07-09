import { useEffect, useState } from 'react';

import {
  isIosNonSafariBrowser,
  isIosSafari,
  isStandaloneDisplay,
} from '../device-detection';
import { usePwaInstall } from '../use-pwa-install';
import { PwaInstallBanner } from './PwaInstallBanner';
import {
  dismissIosInstallSheet,
  PwaIosInstallSheet,
  PwaIosSafariInstallBanner,
  shouldShowIosInstallSheet,
} from './PwaIosInstallSheet';

/** Platform-aware install guidance — Android prompt vs iOS Safari / Chrome paths. */
export function PwaInstallPrompt() {
  const { canPrompt, installed } = usePwaInstall();
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const [showIosSafariBanner, setShowIosSafariBanner] = useState(false);

  useEffect(() => {
    if (installed || isStandaloneDisplay()) {
      return;
    }
    if (!shouldShowIosInstallSheet()) {
      return;
    }
    if (isIosNonSafariBrowser()) {
      setIosSheetOpen(true);
      return;
    }
    if (isIosSafari()) {
      setShowIosSafariBanner(true);
    }
  }, [installed]);

  if (installed || isStandaloneDisplay()) {
    return null;
  }

  const dismissIos = () => {
    dismissIosInstallSheet();
    setIosSheetOpen(false);
    setShowIosSafariBanner(false);
  };

  return (
    <>
      {canPrompt ? <PwaInstallBanner /> : null}
      {showIosSafariBanner ? <PwaIosSafariInstallBanner onDismiss={dismissIos} /> : null}
      <PwaIosInstallSheet open={iosSheetOpen} onDismiss={dismissIos} />
    </>
  );
}
