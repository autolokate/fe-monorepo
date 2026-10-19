/**
 * Node test env: axios uses the http adapter (nock-friendly). Session + env
 * code expect `window` / `localStorage` — provide minimal shims.
 */
const memory = new Map<string, string>();

const localStorageShim: Storage = {
  get length() {
    return memory.size;
  },
  clear() {
    memory.clear();
  },
  getItem(key: string) {
    return memory.get(key) ?? null;
  },
  key(index: number) {
    return [...memory.keys()][index] ?? null;
  },
  removeItem(key: string) {
    memory.delete(key);
  },
  setItem(key: string, value: string) {
    memory.set(key, value);
  },
};

const locationShim = { origin: 'http://localhost:3000' };

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageShim,
  configurable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: {
    localStorage: localStorageShim,
    location: locationShim,
  },
  configurable: true,
});
