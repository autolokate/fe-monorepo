import type { ReactNode } from 'react';

import { PwaInstallProvider } from '../PwaInstallProvider';
import { useOnlineStatus } from '../use-online-status';
import { PwaOfflineScreen } from './PwaOfflineScreen';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';
import { PwaShellActions } from './PwaShellActions';

import './PwaOfflineBanner.css';

type PwaAppShellProps = {
  children: ReactNode;
};

function hasActiveServiceWorker(): boolean {
  return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
}

/** Global PWA shell — offline recovery, install guidance, and update prompts. */
export function PwaAppShell({ children }: PwaAppShellProps) {
  const online = useOnlineStatus();
  const cachedShellReady = hasActiveServiceWorker();

  if (!online && !cachedShellReady) {
    return (
      <PwaInstallProvider>
        <PwaOfflineScreen />
        <PwaShellActions />
        <PwaUpdatePrompt />
      </PwaInstallProvider>
    );
  }

  return (
    <PwaInstallProvider>
      {!online ? (
        <div className="pwa-offline-banner" role="status">
          You're offline. Cached screens stay available until you're back online.
        </div>
      ) : null}
      {children}
      <PwaShellActions />
      <PwaUpdatePrompt />
    </PwaInstallProvider>
  );
}
