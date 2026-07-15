/**
 * Purchase-flow handoff state, persisted in localStorage instead of the URL.
 * The plan cards write the selected plan + the page they were clicked from,
 * and the flow reads it once on mount.
 */
const STORAGE_KEY = 'autolokate:purchase-intent';

export interface PurchaseIntent {
  /** Selected plan id ("secure" | "shield" | "shield-plus"). */
  plan?: string;
  /** Path the buyer came from, so the flow can send them back. */
  from?: string;
}

export function writePurchaseIntent(intent: PurchaseIntent): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function readPurchaseIntent(): PurchaseIntent {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PurchaseIntent) : {};
  } catch {
    return {};
  }
}
