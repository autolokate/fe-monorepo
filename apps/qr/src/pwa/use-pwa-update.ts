import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { PWA_UPDATE_DISMISS_KEY } from './constants.js';

export function usePwaUpdate() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegistered(registration) {
      if (!registration) {
        return;
      }

      registration.update().catch(() => {
        // ignore background update errors
      });
    },
  });

  useEffect(() => {
    const raw = window.sessionStorage.getItem(PWA_UPDATE_DISMISS_KEY);
    if (raw === '1') {
      setDismissed(true);
    }
  }, []);

  const dismissUpdate = () => {
    window.sessionStorage.setItem(PWA_UPDATE_DISMISS_KEY, '1');
    setDismissed(true);
    setNeedRefresh(false);
  };

  const applyUpdate = async () => {
    await updateServiceWorker(true);
    window.sessionStorage.removeItem(PWA_UPDATE_DISMISS_KEY);
  };

  return {
    updateAvailable: needRefresh && !dismissed,
    applyUpdate,
    dismissUpdate,
  };
}
