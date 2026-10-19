import type { Page, Route } from '@playwright/test';

/** Synthetic fixture identities only — never real accounts / QR / transfer rows. */
export const HERMETIC_QR_CODE = 'ALK-HERM-OT';
export const HERMETIC_TRANSFER_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
export const HERMETIC_VEHICLE_ID = '11111111-2222-4333-8444-555555555555';
export const HERMETIC_TO_ACCOUNT_ID = '66666666-7777-4888-8999-aaaaaaaaaaaa';
export const HERMETIC_USER_ID = 'hermetic-admin-user';
export const HERMETIC_GARAGE_ORG_ID = 'hermetic-garage-org';
export const HERMETIC_GARAGE_PURCHASE_ID = '99999999-aaaa-4bbb-8ccc-dddddddddddd';
export const HERMETIC_GARAGE_IDEMPOTENCY_KEY = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

export const HERMETIC_TOKENS = {
  accessToken: 'hermetic-admin-access',
  refreshToken: 'hermetic-admin-refresh',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  userId: HERMETIC_USER_ID,
};

const ADMIN_TOKEN_KEY = 'al-admin-auth-tokens-v1';

export type HermeticSessionRole = 'ADMIN' | 'READ_ONLY' | 'SUPPORT' | 'OPS';

export type HermeticCapture = {
  initiate: Array<{ method: string; path: string; body: unknown }>;
  approve: Array<{ method: string; path: string; body: unknown }>;
  garageConfigGet: number;
  garageConfigPut: Array<{ method: string; path: string; body: unknown }>;
  garagePassGrant: Array<{ method: string; path: string; body: unknown }>;
  garageFreeBidsAdjust: Array<{ method: string; path: string; body: unknown }>;
  unexpected: string[];
};

export const HERMETIC_GARAGE_CONFIG = {
  id: 'cccccccc-dddd-4eee-8fff-000000000001',
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

function envelope<T>(data: T) {
  return {
    data,
    meta: { requestId: 'hermetic-req', correlationId: 'hermetic-corr' },
  };
}

function errorEnvelope(statusMessage: string, code = 'forbidden') {
  return {
    error: {
      code,
      message: statusMessage,
      requestId: 'hermetic-req',
      correlationId: 'hermetic-corr',
    },
  };
}

async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export type InstallHermeticRoutesOptions = {
  sessionRole?: HermeticSessionRole;
  /** When set, initiate POST returns this status instead of 201. */
  initiateStatus?: number;
  /** When set, approve POST returns this status instead of 200. */
  approveStatus?: number;
  /** When set, garage commercial-config GET returns this status instead of 200. */
  garageConfigGetStatus?: number;
  /** When set, garage commercial-config PUT returns this status instead of 200. */
  garageConfigPutStatus?: number;
  /** When set, garage pass grant POST returns this status instead of 200. */
  garagePassGrantStatus?: number;
  /** When set, garage free-bids adjust POST returns this status instead of 200. */
  garageFreeBidsAdjustStatus?: number;
};

/**
 * Stub AdminAuthProvider bootstrap + ownership-transfer + garage admin endpoints.
 * Unhandled `/v1/*` and `/admin/v1/*` → 404 recorded as unexpected (network isolation).
 */
export async function installHermeticApiRoutes(
  page: Page,
  options: InstallHermeticRoutesOptions = {},
): Promise<HermeticCapture> {
  const sessionRole = options.sessionRole ?? 'ADMIN';
  const initiateStatus = options.initiateStatus ?? 201;
  const approveStatus = options.approveStatus ?? 200;
  const garageConfigGetStatus = options.garageConfigGetStatus ?? 200;
  const garageConfigPutStatus = options.garageConfigPutStatus ?? 200;
  const garagePassGrantStatus = options.garagePassGrantStatus ?? 200;
  const garageFreeBidsAdjustStatus = options.garageFreeBidsAdjustStatus ?? 200;

  const capture: HermeticCapture = {
    initiate: [],
    approve: [],
    garageConfigGet: 0,
    garageConfigPut: [],
    garagePassGrant: [],
    garageFreeBidsAdjust: [],
    unexpected: [],
  };

  const availableRoles =
    sessionRole === 'ADMIN' ? ['ADMIN', 'CONSUMER'] : [sessionRole, 'CONSUMER'];

  await page.route('**/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (method === 'GET' && path === '/v1/profile') {
      await fulfillJson(
        route,
        200,
        envelope({
          name: 'Hermetic Admin',
          locale: 'en',
          photoMediaId: null,
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/v1/auth/session') {
      await fulfillJson(
        route,
        200,
        envelope({
          role: sessionRole,
          availableRoles,
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/v1/auth/refresh') {
      await fulfillJson(
        route,
        200,
        envelope({
          accessToken: HERMETIC_TOKENS.accessToken,
          refreshToken: HERMETIC_TOKENS.refreshToken,
          expiresAt: HERMETIC_TOKENS.expiresAt,
          userId: HERMETIC_TOKENS.userId,
        }),
      );
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled hermetic stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  await page.route('**/admin/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    // Prefetch warm after auth — empty fixtures so bootstrap does not toast-fail.
    if (method === 'GET' && path === '/admin/v1/inventory') {
      await fulfillJson(route, 200, envelope([]));
      return;
    }
    if (method === 'GET' && path === '/admin/v1/promos') {
      await fulfillJson(route, 200, envelope([]));
      return;
    }
    if (method === 'GET' && path === '/admin/v1/audit-events') {
      await fulfillJson(route, 200, envelope([]));
      return;
    }
    if (method === 'GET' && path === '/admin/v1/plans') {
      await fulfillJson(route, 200, envelope([]));
      return;
    }
    if (method === 'GET' && path === '/admin/v1/skus') {
      await fulfillJson(route, 200, envelope([]));
      return;
    }

    if (method === 'POST' && path === '/admin/v1/ownership-transfers') {
      const body = JSON.parse(req.postData() ?? '{}') as unknown;
      capture.initiate.push({ method, path, body });
      if (initiateStatus >= 400) {
        await fulfillJson(route, initiateStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(
        route,
        initiateStatus,
        envelope({
          transferId: HERMETIC_TRANSFER_ID,
          vehicleId: HERMETIC_VEHICLE_ID,
          status: 'INITIATED',
        }),
      );
      return;
    }

    const approveMatch = path.match(/^\/admin\/v1\/ownership-transfers\/([^/]+)\/approve$/);
    if (method === 'POST' && approveMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as unknown;
      capture.approve.push({ method, path, body });
      if (approveStatus >= 400) {
        await fulfillJson(route, approveStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(
        route,
        approveStatus,
        envelope({
          transferId: approveMatch[1],
          vehicleId: HERMETIC_VEHICLE_ID,
          toAccountId: HERMETIC_TO_ACCOUNT_ID,
          status: 'COMPLETED',
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/garage/commercial-config') {
      capture.garageConfigGet += 1;
      if (garageConfigGetStatus >= 400) {
        await fulfillJson(
          route,
          garageConfigGetStatus,
          errorEnvelope('Unable to load commercial config', 'forbidden'),
        );
        return;
      }
      await fulfillJson(route, garageConfigGetStatus, envelope(HERMETIC_GARAGE_CONFIG));
      return;
    }

    if (method === 'PUT' && path === '/admin/v1/garage/commercial-config') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.garageConfigPut.push({ method, path, body });
      if (garageConfigPutStatus >= 400) {
        await fulfillJson(route, garageConfigPutStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(
        route,
        garageConfigPutStatus,
        envelope({
          ...HERMETIC_GARAGE_CONFIG,
          ...body,
          updatedAt: '2026-10-19T00:00:00.000Z',
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/garage/commercial-config/history') {
      await fulfillJson(route, 200, envelope([]));
      return;
    }

    const grantMatch = path.match(/^\/admin\/v1\/garage\/orgs\/([^/]+)\/passes\/grant$/);
    if (method === 'POST' && grantMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as unknown;
      capture.garagePassGrant.push({ method, path, body });
      if (garagePassGrantStatus >= 400) {
        await fulfillJson(route, garagePassGrantStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const kind =
        typeof body === 'object' &&
        body !== null &&
        'kind' in body &&
        (body.kind === 'DAY' || body.kind === 'MONTH')
          ? body.kind
          : 'DAY';
      await fulfillJson(
        route,
        garagePassGrantStatus,
        envelope({
          orgId: decodeURIComponent(grantMatch[1] ?? HERMETIC_GARAGE_ORG_ID),
          kind,
          startsAt: '2026-10-19T00:00:00.000Z',
          endsAt: '2026-10-20T00:00:00.000Z',
          amountRupees: kind === 'MONTH' ? 1800 : 100,
          purchaseId: HERMETIC_GARAGE_PURCHASE_ID,
        }),
      );
      return;
    }

    const adjustMatch = path.match(/^\/admin\/v1\/garage\/orgs\/([^/]+)\/free-bids\/adjust$/);
    if (method === 'POST' && adjustMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as { delta?: number };
      capture.garageFreeBidsAdjust.push({ method, path, body });
      if (garageFreeBidsAdjustStatus >= 400) {
        await fulfillJson(
          route,
          garageFreeBidsAdjustStatus,
          errorEnvelope('Forbidden', 'forbidden'),
        );
        return;
      }
      const delta = typeof body.delta === 'number' ? body.delta : 0;
      await fulfillJson(
        route,
        garageFreeBidsAdjustStatus,
        envelope({
          orgId: decodeURIComponent(adjustMatch[1] ?? HERMETIC_GARAGE_ORG_ID),
          remaining: Math.max(0, 2 + delta),
          lifetimeGranted: Math.max(2, 2 + delta),
        }),
      );
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled hermetic stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  return capture;
}

/** Inject synthetic session tokens before the Admin app mounts. */
export async function seedHermeticSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    { key: ADMIN_TOKEN_KEY, value: HERMETIC_TOKENS },
  );
}

/** Land on ownership-transfers after auth bootstrap. */
export async function openOwnershipTransfersPage(page: Page): Promise<void> {
  await page.goto('/ownership-transfers', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Ownership' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on garage commercial after auth bootstrap. */
export async function openGarageCommercialPage(page: Page): Promise<void> {
  await page.goto('/garage-commercial', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Garage commercial' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}
