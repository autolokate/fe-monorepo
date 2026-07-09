import { useCallback, useEffect, useState } from 'react';

import {
  readPwaInstallDismissedRecently,
  writePwaInstallDismissedAt,
} from './install-dismiss-storage';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [dismissedRecently, setDismissedRecently] = useState(readPwaInstallDismissedRecently);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !installed;
  const canPrompt = canInstall && !dismissedRecently;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === 'accepted') {
      setInstalled(true);
      return true;
    }

    writePwaInstallDismissedAt();
    setDismissedRecently(true);
    return false;
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    writePwaInstallDismissedAt();
    setDismissedRecently(true);
  }, []);

  return {
    canInstall,
    canPrompt,
    installed,
    promptInstall,
    dismissPrompt,
  };
}
