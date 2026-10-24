import { describe, expect, it, vi } from 'vitest';

import { ApiClient } from './client';
import { endpoints } from './endpoints';
import {
  adjustGarageFreeBids,
  getGarageCommercialConfig,
  grantGaragePass,
  listGarageCommercialConfigHistory,
  provisionGarage,
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

  it('GETs commercial-config history with optional limit query', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: [], meta: { requestId: 'r', correlationId: 'c' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    const client = new ApiClient({
      baseUrl: 'https://example.test',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'token',
    });
    await listGarageCommercialConfigHistory(client, { limit: 50 });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain(endpoints.admin.garageCommercialConfigHistory);
    expect(String(url)).toContain('limit=50');
    expect(init.method ?? 'GET').toBe('GET');
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

  it('POSTs garage provision with OpenAPI body shape', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              orgId: '11111111-1111-4111-8111-111111111111',
              staffId: '22222222-2222-4222-8222-222222222222',
              storeId: '33333333-3333-4333-8333-333333333333',
              kycRecordId: '44444444-4444-4444-8444-444444444444',
              storeStatus: 'DRAFT',
              freeBidsGranted: true,
              freeBidsRemaining: 2,
              freeBidLifetimeGranted: 2,
              converged: true,
            },
            meta: { requestId: 'r', correlationId: 'c' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    );
    const client = new ApiClient({
      baseUrl: 'https://example.test',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'token',
    });
    const result = await provisionGarage(client, {
      accountId: '55555555-5555-4555-8555-555555555555',
      orgName: 'Kapil Motors',
      ownerName: 'Kapil',
    });
    expect(result.orgId).toBe('11111111-1111-4111-8111-111111111111');
    expect(result.storeStatus).toBe('DRAFT');
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain(endpoints.admin.garageProvision);
    expect(init.method).toBe('POST');
  });
});
