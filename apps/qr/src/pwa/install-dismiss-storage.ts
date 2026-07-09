import { PWA_INSTALL_DISMISS_KEY, PWA_INSTALL_DISMISS_MS } from './constants.js';

export function readPwaInstallDismissedRecently(): boolean {
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

export function writePwaInstallDismissedAt(timestamp = Date.now()): void {
  try {
    window.localStorage.setItem(PWA_INSTALL_DISMISS_KEY, String(timestamp));
  } catch {
    // ignore private mode / storage disabled
  }
}
