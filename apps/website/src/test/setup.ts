/**
 * Node test env: the session layer expects `window`, `sessionStorage` and `localStorage`
 * (legacy-store migration). Provide minimal in-memory shims plus a real EventTarget so
 * session-change events can be observed.
 */
function createMemoryStorage(): Storage {
  const memory = new Map<string, string>();
  return {
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
}

const localStorageShim = createMemoryStorage();
const sessionStorageShim = createMemoryStorage();
const events = new EventTarget();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageShim, configurable: true });
Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageShim,
  configurable: true,
});
Object.defineProperty(globalThis, 'window', {
  value: {
    localStorage: localStorageShim,
    sessionStorage: sessionStorageShim,
    location: { origin: 'http://localhost:3000' },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  },
  configurable: true,
});
