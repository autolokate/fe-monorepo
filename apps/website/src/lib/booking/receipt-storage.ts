import type { StoredConsultReceipt } from "./types";

const STORAGE_KEY = "autolokate_consult_receipt_api";

export function storeConsultReceipt(receipt: StoredConsultReceipt): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(receipt));
  } catch {
    // sessionStorage may be unavailable (private mode, quota); ignore — UI still
    // shows the confirmation toast and the booking row.
  }
}

export function readConsultReceipt(): StoredConsultReceipt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredConsultReceipt;
  } catch {
    return null;
  }
}

export function clearConsultReceipt(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // best effort
  }
}
