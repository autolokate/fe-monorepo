import { isIosDevice } from '../pwa/device-detection.js';

export type DevicePickedContact = {
  name: string;
  mobile: string;
};

export type DeviceContactPickResult =
  | { outcome: 'picked'; contact: DevicePickedContact }
  | { outcome: 'cancelled' }
  | { outcome: 'unsupported' }
  | { outcome: 'failed' };

type ContactPickerNavigator = Navigator & {
  contacts?: {
    getProperties?: () => Promise<Array<'name' | 'tel' | 'email' | 'address' | 'icon'>>;
    select: (
      properties: Array<'name' | 'tel' | 'email'>,
      options?: { multiple?: boolean },
    ) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
  };
};

function normalizeIndianMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return null;
}

function pickName(raw?: string[]): string {
  const candidate = raw?.find((part) => part.trim().length > 0);
  return candidate?.trim() ?? '';
}

function pickMobile(raw?: string[]): string | null {
  if (!raw?.length) {
    return null;
  }
  for (const entry of raw) {
    const normalized = normalizeIndianMobile(entry);
    if (normalized) {
      return normalized;
    }
  }
  return null;
}

export function isContactPickerSupported(): boolean {
  if (typeof window === 'undefined' || !window.isSecureContext) {
    return false;
  }

  const contactsApi = (navigator as ContactPickerNavigator).contacts;
  return typeof contactsApi?.select === 'function';
}

/** Document-only — for QA reports. */
export function getContactPickerPlatformNote(): string {
  if (isContactPickerSupported()) {
    return 'Contact Picker API available — Add from contacts shown.';
  }
  if (isIosDevice()) {
    return 'iOS (Safari, Chrome, Edge, PWA standalone): Contact Picker API not available in production — Add from contacts hidden.';
  }
  return 'Contact Picker API unavailable — Add from contacts hidden; manual entry only.';
}

/** E0 shows Add from contacts only when native picker is supported. */
export function shouldShowAddFromContactsCTA(): boolean {
  return isContactPickerSupported();
}

/** Opens native contact picker when supported. */
export async function pickDeviceContactWithStatus(): Promise<DeviceContactPickResult> {
  const contactsApi = (navigator as ContactPickerNavigator).contacts;
  if (!contactsApi?.select) {
    return { outcome: 'unsupported' };
  }

  try {
    if (contactsApi.getProperties) {
      await contactsApi.getProperties();
    }

    const results = await contactsApi.select(['name', 'tel'], { multiple: false });
    const picked = results[0];
    if (!picked) {
      return { outcome: 'cancelled' };
    }

    const name = pickName(picked.name);
    const mobile = pickMobile(picked.tel);
    if (!mobile) {
      return { outcome: 'failed' };
    }

    return { outcome: 'picked', contact: { name, mobile } };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { outcome: 'cancelled' };
    }
    if (error instanceof Error && error.name === 'AbortError') {
      return { outcome: 'cancelled' };
    }
    return { outcome: 'failed' };
  }
}

/** @deprecated Use pickDeviceContactWithStatus — returns null on cancel, unsupported, or error. */
export async function pickDeviceContact(): Promise<DevicePickedContact | null> {
  const result = await pickDeviceContactWithStatus();
  return result.outcome === 'picked' ? result.contact : null;
}