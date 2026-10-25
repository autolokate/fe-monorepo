import type { Page, Route } from '@playwright/test';

/** Synthetic Partners fixtures only — never real partner orgs / RFQs. */
export const HERMETIC_PARTNER_ORG_ID = 'aaaaaaaa-0000-4000-8000-0000000000aa';
export const HERMETIC_PARTNER_REEL_ID = 'bbbbbbbb-0000-4000-8000-0000000000bb';
export const HERMETIC_GARAGE_REQUEST_ID = 'cccccccc-0000-4000-8000-0000000000cc';
export const HERMETIC_GARAGE_BID_ID = 'dddddddd-0000-4000-8000-0000000000dd';
export const HERMETIC_TAXI_REQUEST_ID = 'eeeeeeee-0000-4000-8000-0000000000ee';
export const HERMETIC_TAXI_BID_ID = 'ffffffff-0000-4000-8000-0000000000ff';

const NOW = '2026-10-20T12:00:00.000Z';

function envelope<T>(
  data: T,
  pagination?: {
    limit: number;
    cursor: string | null;
    nextCursor: string | null;
    hasMore: boolean;
  },
) {
  return {
    data,
    meta: {
      requestId: 'hermetic-req',
      correlationId: 'hermetic-corr',
      ...(pagination ? { pagination } : {}),
    },
  };
}

function errorEnvelope(message: string, code: string) {
  return {
    error: { code, message, requestId: 'hermetic-req', correlationId: 'hermetic-corr' },
  };
}

async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

export type HermeticPartnersCapture = {
  partnersList: Array<{ query: string }>;
  partnerDetail: string[];
  garageRequestsList: Array<{ query: string }>;
  taxiRequestsList: Array<{ query: string }>;
  unexpected: string[];
};

export type InstallHermeticPartnersOptions = {
  /** Status for list/detail Admin Partners routes; 404 simulates "not deployed here". */
  listStatus?: number;
};

/**
 * Hermetic stubs for `/admin/v1/partners*` + `/admin/v1/taxi/requests*`.
 * Does not claim Live OA support.
 */
export async function installHermeticPartnersRoutes(
  page: Page,
  options: InstallHermeticPartnersOptions = {},
): Promise<HermeticPartnersCapture> {
  const listStatus = options.listStatus ?? 200;
  const capture: HermeticPartnersCapture = {
    partnersList: [],
    partnerDetail: [],
    garageRequestsList: [],
    taxiRequestsList: [],
    unexpected: [],
  };

  const partner = {
    orgId: HERMETIC_PARTNER_ORG_ID,
    name: 'Hermetic Garage Partner',
    partnerKind: 'GARAGE',
    orgKind: 'WORKSHOP',
    ownerAccountId: 'aaaaaaaa-0000-4000-8000-000000000001',
    createdAt: NOW,
    storeId: 'aaaaaaaa-0000-4000-8000-000000000002',
    storeName: 'Hermetic Store',
    storeStatus: 'PUBLISHED',
    cities: ['Pune'],
  };

  const reel = {
    reelId: HERMETIC_PARTNER_REEL_ID,
    stableKey: 'hermetic-reel',
    title: 'Hermetic AutoClip',
    status: 'PUBLISHED',
    publishedAt: NOW,
  };

  const garageRequest = {
    id: HERMETIC_GARAGE_REQUEST_ID,
    accountId: 'aaaaaaaa-0000-4000-8000-000000000003',
    vehicleId: 'aaaaaaaa-0000-4000-8000-000000000004',
    category: 'Service',
    subcategory: 'Oil change',
    title: 'Hermetic garage request',
    description: 'Synthetic RFQ body',
    urgency: 'THIS_WEEK',
    locality: 'Kothrud',
    city: 'Pune',
    state: 'MH',
    status: 'OPEN',
    closesAt: NOW,
    sourceReelId: null,
    preferredOrgId: null,
    createdAt: NOW,
    updatedAt: NOW,
    bids: [
      {
        id: HERMETIC_GARAGE_BID_ID,
        serviceRequestId: HERMETIC_GARAGE_REQUEST_ID,
        orgId: HERMETIC_PARTNER_ORG_ID,
        amountRupees: 1500,
        status: 'SUBMITTED',
        startsOn: '2026-10-22',
        completionHours: 4,
        warrantyDays: 30,
        note: null,
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  };

  const taxiRequest = {
    id: HERMETIC_TAXI_REQUEST_ID,
    accountId: 'aaaaaaaa-0000-4000-8000-000000000005',
    status: 'OPEN',
    pickupAt: NOW,
    pickupLabel: 'Kothrud, Pune',
    dropoffLabel: 'Airport',
    estimatedFareRupees: 450,
    notes: null,
    closesAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    bids: [
      {
        id: HERMETIC_TAXI_BID_ID,
        requestId: HERMETIC_TAXI_REQUEST_ID,
        orgId: HERMETIC_PARTNER_ORG_ID,
        vehicleId: 'aaaaaaaa-0000-4000-8000-000000000006',
        proposedDriverAccountId: null,
        fareRupees: 420,
        status: 'SUBMITTED',
        message: null,
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  };

  await page.route('**/admin/v1/partners**', async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') {
      capture.unexpected.push(`${request.method()} ${request.url()}`);
      await fulfillJson(route, 405, errorEnvelope('Method not allowed', 'method_not_allowed'));
      return;
    }

    const url = new URL(request.url());
    const path = url.pathname;

    if (
      path.endsWith('/admin/v1/partners/requests') ||
      path.match(/\/admin\/v1\/partners\/requests$/)
    ) {
      capture.garageRequestsList.push({ query: url.search });
      if (listStatus !== 200) {
        await fulfillJson(route, listStatus, errorEnvelope('Not deployed', 'not_found'));
        return;
      }
      await fulfillJson(
        route,
        200,
        envelope([garageRequest], {
          limit: 20,
          cursor: null,
          nextCursor: null,
          hasMore: false,
        }),
      );
      return;
    }

    const requestDetail = path.match(/\/admin\/v1\/partners\/requests\/([^/]+)$/);
    if (requestDetail) {
      if (listStatus !== 200) {
        await fulfillJson(route, listStatus, errorEnvelope('Not deployed', 'not_found'));
        return;
      }
      await fulfillJson(route, 200, envelope(garageRequest));
      return;
    }

    const partnerDetail = path.match(/\/admin\/v1\/partners\/([^/]+)$/);
    if (partnerDetail && partnerDetail[1] !== 'requests') {
      capture.partnerDetail.push(partnerDetail[1] ?? '');
      if (listStatus !== 200) {
        await fulfillJson(route, listStatus, errorEnvelope('Not deployed', 'not_found'));
        return;
      }
      await fulfillJson(route, 200, envelope({ ...partner, reels: [reel] }));
      return;
    }

    if (path.endsWith('/admin/v1/partners') || path.match(/\/admin\/v1\/partners$/)) {
      capture.partnersList.push({ query: url.search });
      if (listStatus !== 200) {
        await fulfillJson(route, listStatus, errorEnvelope('Not deployed', 'not_found'));
        return;
      }
      const type = url.searchParams.get('type');
      const items = type === 'TAXI' ? [] : [partner];
      await fulfillJson(
        route,
        200,
        envelope(items, {
          limit: 20,
          cursor: null,
          nextCursor: null,
          hasMore: false,
        }),
      );
      return;
    }

    capture.unexpected.push(`${request.method()} ${path}`);
    await fulfillJson(route, 404, errorEnvelope('Unhandled partners path', 'not_found'));
  });

  await page.route('**/admin/v1/taxi/requests**', async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') {
      capture.unexpected.push(`${request.method()} ${request.url()}`);
      await fulfillJson(route, 405, errorEnvelope('Method not allowed', 'method_not_allowed'));
      return;
    }

    const url = new URL(request.url());
    const path = url.pathname;

    if (path.endsWith('/admin/v1/taxi/requests') || path.match(/\/admin\/v1\/taxi\/requests$/)) {
      capture.taxiRequestsList.push({ query: url.search });
      if (listStatus !== 200) {
        await fulfillJson(route, listStatus, errorEnvelope('Not deployed', 'not_found'));
        return;
      }
      await fulfillJson(
        route,
        200,
        envelope([taxiRequest], {
          limit: 20,
          cursor: null,
          nextCursor: null,
          hasMore: false,
        }),
      );
      return;
    }

    const detail = path.match(/\/admin\/v1\/taxi\/requests\/([^/]+)$/);
    if (detail) {
      if (listStatus !== 200) {
        await fulfillJson(route, listStatus, errorEnvelope('Not deployed', 'not_found'));
        return;
      }
      await fulfillJson(route, 200, envelope(taxiRequest));
      return;
    }

    capture.unexpected.push(`${request.method()} ${path}`);
    await fulfillJson(route, 404, errorEnvelope('Unhandled taxi requests path', 'not_found'));
  });

  return capture;
}

export async function openPartnersDirectoryPage(page: Page): Promise<void> {
  await page.goto('/partners', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Partners', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

export async function openPartnersRequestsPage(page: Page): Promise<void> {
  await page.goto('/partners/requests', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Requests & bids', exact: true })
    .waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

export async function openPartnerDetailPage(
  page: Page,
  orgId = HERMETIC_PARTNER_ORG_ID,
): Promise<void> {
  await page.goto(`/partners/${orgId}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('partners-detail-summary').waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}
