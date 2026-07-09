import type { ReactNode } from 'react';

import { useOnlineStatus } from '../use-online-status';
import { PwaOfflineScreen } from './PwaOfflineScreen';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { PwaShellActions } from './PwaShellActions';

import './PwaOfflineBanner.css';

type PwaAppShellProps = {
  children: ReactNode;
};

function hasActiveServiceWorker(): boolean {
  return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
}

/** Global PWA shell — offline recovery and update prompts without touching flow routes. */
export function PwaAppShell({ children }: PwaAppShellProps) {
  const online = useOnlineStatus();
  const cachedShellReady = hasActiveServiceWorker();

  if (!online && !cachedShellReady) {
    return (
      <>
        <PwaOfflineScreen />
        <PwaShellActions />
        <PwaUpdatePrompt />
      </>
    );
  }

  return (
    <>
      {!online ? (
        <div className="pwa-offline-banner" role="status">
          You're offline. Cached screens stay available until you're back online.
        </div>
      ) : null}
      {children}
      <PwaShellActions />
      <PwaInstallPrompt />
      <PwaUpdatePrompt />
    </>
  );
}
