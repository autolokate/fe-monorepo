'use client';

/**
 * The add/edit forms live in a separate route segment (the `@modal` slot or a
 * standalone page) from the address list, so they can't share a query hook.
 * After a successful mutation we broadcast this event; the list listens and
 * refetches. A no-op on the server.
 */
export const ADDRESSES_CHANGED = 'autolokate:addresses-changed';

export function emitAddressesChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(ADDRESSES_CHANGED));
}
