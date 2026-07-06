import { useCallback, useEffect, useState } from 'react';

import { PWA_INSTALL_DISMISS_KEY, PWA_INSTALL_DISMISS_MS } from './constants.js';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function readDismissedRecently(): boolean {
  try {
    const raw = window.localStorage.getItem(PWA_INSTALL_DISMISS_KEY);
    if (!raw) {
      return false;
    }
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) {
      return false;
    }
    return Date.now() - dismissedAt < PWA_INSTALL_DISMISS_MS;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [dismissedRecently, setDismissedRecently] = useState(readDismissedRecently);

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

    try {
      window.localStorage.setItem(PWA_INSTALL_DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setDismissedRecently(true);
    return false;
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    try {
      window.localStorage.setItem(PWA_INSTALL_DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
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
