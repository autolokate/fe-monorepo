import { buildScanPaths, parseJourneyIdFromPathname, ROUTE_NAMESPACE } from '../../../journey/routing/journey-url-routing';

function readQrCodeFromUrl(): string {
  if (typeof window === 'undefined') {
    return '_';
  }
  return parseJourneyIdFromPathname(window.location.pathname) ?? '_';
}

/** Canonical post-activation scan paths under `/scan/:qrCode/*`. */
export const pwaScanPaths = new Proxy({} as ReturnType<typeof buildScanPaths>, {
  get(_target, prop: string) {
    const paths = buildScanPaths(readQrCodeFromUrl());
    return paths[prop as keyof typeof paths];
  },
});

/** Legacy prefix — redirects to `/scan/:qrCode/*`. */
export const LEGACY_PWA_SCAN_ROOT = '/pwa/scan';

export const PWA_SCAN_STORAGE_KEY = 'al-pwa-scan-v1';

export const PWA_BOOTSTRAP_MS = 1200;
export const PWA_SOS_HOLD_MS = 4000;
export const PWA_STATUS_STEP_MS = 2500;

export { ROUTE_NAMESPACE };
