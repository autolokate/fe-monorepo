const DEVICE_ID_STORAGE_KEY = 'al-device-id-v1';

function readLocalStorage(key: string): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(key);
}

function writeLocalStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(key, value);
}

function createUuidV4(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Persistent device identity — generated once and reused for OTP verify `deviceId`.
 */
export function getDeviceId(): string {
  const existing = readLocalStorage(DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const created = createUuidV4();
  writeLocalStorage(DEVICE_ID_STORAGE_KEY, created);
  return created;
}

export const DEVICE_ID_KEY = DEVICE_ID_STORAGE_KEY;
