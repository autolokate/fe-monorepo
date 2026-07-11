import { usePwaInstallContext } from './PwaInstallProvider';

/** Shared PWA install state — one deferred prompt for banner + top-right icon. */
export function usePwaInstall() {
  return usePwaInstallContext();
}
