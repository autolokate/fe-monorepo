import { describe, expect, it, vi } from 'vitest';

import { ApiClient } from './client';
import {
  addAdminSosNote,
  getAdminSosIncident,
  listAdminSosIncidents,
  resolveAdminSosIncident,
  runAdminSosAction,
} from './sos-admin';

const META = { requestId: 'r', correlationId: 'c' };

function ok(data: unknown): Response {
  return new Response(JSON.stringify({ data, meta: META }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function setup() {
  const fetchImpl = vi.fn().mockImplementation(() => Promise.resolve(ok([])));
  const client = new ApiClient({
    baseUrl: 'https://example.test',
    fetch: fetchImpl as unknown as typeof fetch,
    getAccessToken: () => 'token',
  });
  const call = (i = 0) => {
    const [url, init] = fetchImpl.mock.calls[i] as [string, RequestInit];
    return { url, method: init.method ?? 'GET', body: init.body };
  };
  return { client, fetchImpl, call };
}

describe('admin SOS console contract', () => {
  it('list sends state csv, updatedSince and limit', async () => {
    const { client, call } = setup();
    await listAdminSosIncidents(client, {
      states: ['CALLING_USER_1', 'USER_NEEDS_HELP'],
      updatedSince: '2026-11-05T10:00:00.000Z',
      limit: 100,
    });
    const url = new URL(call().url);
    expect(url.pathname).toBe('/admin/v1/sos-incidents');
    expect(url.searchParams.get('state')).toBe('CALLING_USER_1,USER_NEEDS_HELP');
    expect(url.searchParams.get('updatedSince')).toBe('2026-11-05T10:00:00.000Z');
    expect(url.searchParams.get('limit')).toBe('100');
  });

  it('detail + actions hit the documented paths and bodies', async () => {
    const { client, fetchImpl, call } = setup();
    fetchImpl.mockImplementation(() => Promise.resolve(ok({ incidentId: 'i 1' })));
    await getAdminSosIncident(client, 'i 1');
    await runAdminSosAction(client, 'i 1', 'notify-family');
    await runAdminSosAction(client, 'i 1', 'request-ambulance');
    await runAdminSosAction(client, 'i 1', 'call-user');
    await resolveAdminSosIncident(client, 'i 1', 'FALSE_ALARM');
    await addAdminSosNote(client, 'i 1', 'Spoke to user');

    const base = 'https://example.test/admin/v1/sos-incidents/i%201';
    expect(call(0)).toMatchObject({ url: base, method: 'GET' });
    expect(call(1)).toMatchObject({ url: `${base}/actions/notify-family`, method: 'POST' });
    expect(call(2)).toMatchObject({ url: `${base}/actions/request-ambulance`, method: 'POST' });
    expect(call(3)).toMatchObject({ url: `${base}/actions/call-user`, method: 'POST' });
    expect(call(4)).toMatchObject({
      url: `${base}/actions/resolve`,
      body: JSON.stringify({ outcome: 'FALSE_ALARM' }),
    });
    expect(call(5)).toMatchObject({
      url: `${base}/notes`,
      body: JSON.stringify({ text: 'Spoke to user' }),
    });
  });
});
