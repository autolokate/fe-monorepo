import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  dismissIosInstallSheet,
  PwaIosInstallSheet,
  PwaIosSafariInstallBanner,
  shouldShowIosInstallSheet,
} from './components/PwaIosInstallSheet';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { isIosNonSafariBrowser, isIosSafari, isStandaloneDisplay } from './device-detection';
import {
  readPwaInstallDismissedRecently,
  writePwaInstallDismissedAt,
} from './install-dismiss-storage';

import './components/PwaInstallPrompt.css';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type PwaInstallContextValue = {
  installed: boolean;
  canInstall: boolean;
  canPrompt: boolean;
  canShowInstallControl: boolean;
  promptInstall: () => Promise<boolean>;
  dismissPrompt: () => void;
  openInstallGuidance: () => void;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

function readInstalledState(): boolean {
  return isStandaloneDisplay();
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(readInstalledState);
  const [dismissedRecently, setDismissedRecently] = useState(readPwaInstallDismissedRecently);
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const [showIosSafariBanner, setShowIosSafariBanner] = useState(false);

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

  const canInstall = Boolean(deferredPrompt) && !installed;
  const canPrompt = canInstall && !dismissedRecently;
  const canShowIosGuidance =
    !installed && !isStandaloneDisplay() && (isIosSafari() || isIosNonSafariBrowser());
  const canShowInstallControl = canInstall || canShowIosGuidance;

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

  const dismissIosGuidance = useCallback(() => {
    dismissIosInstallSheet();
    setIosSheetOpen(false);
    setShowIosSafariBanner(false);
  }, []);

  const openInstallGuidance = useCallback(() => {
    if (canInstall) {
      void promptInstall();
      return;
    }
    if (isIosNonSafariBrowser()) {
      setIosSheetOpen(true);
      return;
    }
    if (isIosSafari()) {
      setShowIosSafariBanner(true);
    }
  }, [canInstall, promptInstall]);

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      installed,
      canInstall,
      canPrompt,
      canShowInstallControl,
      promptInstall,
      dismissPrompt,
      openInstallGuidance,
    }),
    [
      installed,
      canInstall,
      canPrompt,
      canShowInstallControl,
      promptInstall,
      dismissPrompt,
      openInstallGuidance,
    ],
  );

  const showInstallDock =
    !installed && !isStandaloneDisplay() && (canPrompt || showIosSafariBanner);

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      {showInstallDock ? (
        <div className="pwa-install-dock" aria-live="polite">
          {canPrompt ? (
            <PwaInstallBanner onInstall={promptInstall} onDismiss={dismissPrompt} />
          ) : null}
          {showIosSafariBanner ? (
            <PwaIosSafariInstallBanner onDismiss={dismissIosGuidance} />
          ) : null}
        </div>
      ) : null}
      <PwaIosInstallSheet open={iosSheetOpen} onDismiss={dismissIosGuidance} />
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstallContext(): PwaInstallContextValue {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error('usePwaInstallContext must be used within PwaInstallProvider');
  }
  return context;
}
