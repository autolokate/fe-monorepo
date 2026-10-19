import { describe, expect, it, vi } from 'vitest';

import { ApiClient } from './client';
import { endpoints } from './endpoints';
import {
  adjustGarageFreeBids,
  getGarageCommercialConfig,
  grantGaragePass,
  updateGarageCommercialConfig,
} from './garage';

const sampleConfig = {
  id: 'cfg-1',
  welcomeCredits: 20,
  creditsPerFirstBid: 10,
  freeBidLifetimeCount: 2,
  dayPassPriceRupees: 100,
  monthPassPriceRupees: 1800,
  dayPassDurationHours: 24,
  monthPassDurationKind: 'CALENDAR_MONTH_IST' as const,
  gstRateBps: 1800,
  updatedByAdminId: null,
  updatedAt: '2026-10-18T00:00:00.000Z',
};

describe('garage commercial + entitlement admin client', () => {
  it('GETs the OpenAPI commercial-config path and unwraps the envelope', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ data: sampleConfig, meta: { requestId: 'r', correlationId: 'c' } }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    );

    const client = new ApiClient({
      baseUrl: 'https://example.test',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'token',
    });

    const config = await getGarageCommercialConfig(client);
    expect(config.freeBidLifetimeCount).toBe(2);
    expect(config.dayPassPriceRupees).toBe(100);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain(endpoints.admin.garageCommercialConfig);
    expect(init.method ?? 'GET').toBe('GET');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token');
  });

  it('PUTs commercial-config updates', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ data: sampleConfig, meta: { requestId: 'r', correlationId: 'c' } }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    );
    const client = new ApiClient({
      baseUrl: 'https://example.test',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'token',
    });
    const body = {
      welcomeCredits: 20,
      creditsPerFirstBid: 10,
      freeBidLifetimeCount: 2,
      dayPassPriceRupees: 100,
      monthPassPriceRupees: 1800,
      dayPassDurationHours: 24,
      monthPassDurationKind: 'CALENDAR_MONTH_IST' as const,
      gstRateBps: 1800,
    };
    await updateGarageCommercialConfig(client, body);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain(endpoints.admin.garageCommercialConfig);
    expect(init.method).toBe('PUT');
  });

  it('POSTs org pass grant and free-bid adjust paths', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.includes('passes/grant')) {
        return new Response(
          JSON.stringify({
            data: {
              orgId: 'org-1',
              kind: 'DAY',
              startsAt: '2026-10-18T00:00:00.000Z',
              endsAt: '2026-10-19T00:00:00.000Z',
              amountRupees: 100,
              purchaseId: '11111111-1111-4111-8111-111111111111',
            },
            meta: { requestId: 'r', correlationId: 'c' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          data: { orgId: 'org-1', remaining: 3, lifetimeGranted: 3 },
          meta: { requestId: 'r', correlationId: 'c' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    const client = new ApiClient({
      baseUrl: 'https://example.test',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'token',
    });
    const grant = await grantGaragePass(client, 'org-1', { kind: 'DAY' });
    expect(grant.kind).toBe('DAY');
    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain(
      endpoints.admin.garageOrgPassGrant('org-1'),
    );
    const bal = await adjustGarageFreeBids(client, 'org-1', { delta: 1 });
    expect(bal.remaining).toBe(3);
    expect(String(fetchImpl.mock.calls[1]?.[0])).toContain(
      endpoints.admin.garageOrgFreeBidsAdjust('org-1'),
    );
  });
});
