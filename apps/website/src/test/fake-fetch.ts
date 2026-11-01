import { vi } from 'vitest';

import { API_BASE_URL, resetApiClientForTests } from '@/lib/api/client';
import { resetSessionForTests } from '@/lib/session';

export interface RecordedCall {
  method: string;
  /** Path + query, relative to the API base URL. */
  path: string;
  headers: Record<string, string>;
  body: unknown;
}

interface Reply {
  status: number;
  body?: unknown;
}
/** Return a reply, or throw (e.g. `new TypeError('fetch failed')`) to simulate a network error. */
type Handler = (call: RecordedCall) => Reply | Promise<Reply>;

/**
 * Minimal programmable `fetch` for the website's shared API client. Routes are matched on
 * `METHOD path` (path includes the query string); each route can be answered once or many
 * times. Unmatched calls fail the test loudly.
 */
export function installFakeFetch() {
  const routes: { key: string; handler: Handler; times: number }[] = [];
  const calls: RecordedCall[] = [];

  const fake = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const path = url.startsWith(API_BASE_URL) ? url.slice(API_BASE_URL.length) : url;
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = Object.fromEntries(
      Object.entries((init?.headers ?? {}) as Record<string, string>).map(([k, v]) => [
        k.toLowerCase(),
        v,
      ]),
    );
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
    const call: RecordedCall = { method, path, headers, body };
    calls.push(call);

    const route = routes.find((r) => r.key === `${method} ${path}` && r.times > 0);
    if (!route) throw new Error(`Unexpected request: ${method} ${path}`);
    route.times -= 1;
    const reply = await route.handler(call);
    return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), {
      status: reply.status,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  vi.stubGlobal('fetch', fake);

  return {
    calls,
    on(method: string, path: string, handler: Handler | Reply, times = 1) {
      routes.push({
        key: `${method.toUpperCase()} ${path}`,
        handler: typeof handler === 'function' ? handler : () => handler,
        times,
      });
    },
    pending(): string[] {
      return routes.filter((r) => r.times > 0).map((r) => r.key);
    },
  };
}

/** Fresh session + client singletons and empty storages for each test. */
export function resetWebsiteSession(): void {
  sessionStorage.clear();
  localStorage.clear();
  resetSessionForTests();
  resetApiClientForTests();
}

export function envelope<T>(data: T) {
  return { data, meta: { requestId: 'req-1', correlationId: 'corr-1' } };
}
