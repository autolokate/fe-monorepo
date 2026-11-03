import type { Page, Route } from '@playwright/test';

import { HERMETIC_CUSTOMER_ACCOUNT_ID, HERMETIC_VEHICLE_ID } from './hermetic';

/** Synthetic admin-v4 fixtures (users / vehicles / plate scanning / broadcast) — never real rows. */
export const V4_VEHICLE_ID = 'abababab-0000-4000-8000-00000000a001';
export const V4_VEHICLE_ID_B = 'abababab-0000-4000-8000-00000000a002';
export const V4_OWNER_ID = 'abababab-0000-4000-8000-00000000b001';
export const V4_FLAG_ID = 'abababab-0000-4000-8000-00000000c001';
export const V4_FLAG_CLEARED_ID = 'abababab-0000-4000-8000-00000000c002';
export const V4_SCANNER_ID = 'abababab-0000-4000-8000-00000000d001';
export const V4_BROADCAST_ID = 'abababab-0000-4000-8000-00000000e001';
export const V4_PLATE = 'KA01HM4242';

const META = { requestId: 'hermetic-req', correlationId: 'hermetic-corr' };

function page<T>(data: T[], nextCursor: string | null = null) {
  return {
    data,
    meta: {
      ...META,
      pagination: { limit: 25, cursor: null, nextCursor, hasMore: nextCursor !== null },
    },
  };
}

async function json(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

export const V4_PLATE_VEHICLE = {
  vehicleId: V4_VEHICLE_ID,
  registration: V4_PLATE,
  plateKey: 'KA01HM4242',
  ownerAccountId: V4_OWNER_ID,
  ownershipVerified: true,
  protection: 'PROTECTED',
  make: 'Hyundai',
  model: 'Creta',
  color: 'White',
};

export const V4_UNKEYED_VEHICLE = {
  vehicleId: V4_VEHICLE_ID_B,
  registration: 'TEMP-REG 12',
  plateKey: null,
  ownerAccountId: null,
  ownershipVerified: false,
  protection: 'UNPROTECTED',
  make: null,
  model: null,
  color: null,
};

export const V4_INVITE = {
  id: 'abababab-0000-4000-8000-00000000f001',
  vehicleId: HERMETIC_VEHICLE_ID,
  status: 'PENDING',
  phoneMasked: '••••4321',
  inviteeAccountId: null,
  inviteeUsername: null,
  invitedByAccountId: HERMETIC_CUSTOMER_ACCOUNT_ID,
  invitedByUsername: 'hermetic_owner',
  note: 'Weekend driver',
  membershipId: null,
  createdAt: '2026-11-01T09:00:00.000Z',
  expiresAt: '2026-11-08T09:00:00.000Z',
  resolvedAt: null,
};

export const V4_NOTIFICATION = {
  id: 'abababab-0000-4000-8000-00000000f101',
  audience: 'CONSUMER',
  category: 'SYSTEM',
  sourceCategory: 'SYSTEM',
  title: 'Hermetic maintenance notice',
  body: 'The app will be briefly unavailable tonight.',
  deepLink: { screen: 'Notifications' },
  referenceId: null,
  createdAt: '2026-11-02T10:00:00.000Z',
  readAt: null,
  delivery: { status: 'DELIVERED', channel: 'PUSH', sentAt: '2026-11-02T10:00:02.000Z' },
};

export const V4_NOTIFICATION_UNSENT = {
  ...V4_NOTIFICATION,
  id: 'abababab-0000-4000-8000-00000000f102',
  title: 'Hermetic in-app only',
  delivery: null,
};

export const V4_TRIP = {
  tripId: 'dq-hermetic-trip-1',
  vehicleId: HERMETIC_VEHICLE_ID,
  startedAt: '2026-11-01T08:00:00.000Z',
  endedAt: '2026-11-01T08:42:00.000Z',
  distanceKm: 18.4,
  durationMinutes: 42,
  drivingDurationMinutes: 37,
  scores: { safety: 8.7, eco: 7.9, distraction: 9.1, speeding: 8.2 },
  verified: true,
  receivedAt: '2026-11-01T08:45:00.000Z',
  source: 'PUSH',
};

export type UsersV4Capture = {
  notifications: string[];
  devices: number;
  trips: string[];
  driverScore: number;
  userInvites: number;
  vehicleInvites: string[];
  roleRevoke: Array<{ path: string; body: string | null }>;
  plateSearch: string[];
  lookups: string[];
  abuse: string[];
  flagClear: Array<{ path: string; body: string | null }>;
  collisions: string[];
  unparsed: number;
  backfill: number;
  duplicates: number;
  broadcast: unknown[];
};

export type UsersV4Options = {
  /** Status for POST /admin/v1/notifications/system (default 202). */
  broadcastStatus?: number;
  /** Answer every v4 GET with Nest's unrouted 404 (route not deployed). */
  notDeployed?: boolean;
};

/**
 * Layer admin-v4 stubs over `installHermeticApiRoutes` (registered later → matched first). Anything
 * else falls through to the base stubs.
 */
export async function installUsersV4Routes(
  pg: Page,
  options: UsersV4Options = {},
): Promise<UsersV4Capture> {
  const capture: UsersV4Capture = {
    notifications: [],
    devices: 0,
    trips: [],
    driverScore: 0,
    userInvites: 0,
    vehicleInvites: [],
    roleRevoke: [],
    plateSearch: [],
    lookups: [],
    abuse: [],
    flagClear: [],
    collisions: [],
    unparsed: 0,
    backfill: 0,
    duplicates: 0,
    broadcast: [],
  };
  let flagCleared = false;
  let backfilled = false;

  await pg.route(
    /\/admin\/v1\/(users|vehicles|scan|subscriptions|notifications)(\/|\?|$)/,
    async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const path = url.pathname;
      const method = req.method();
      const notDeployed = async () =>
        json(route, 404, { error: { code: 'not_found', message: `Cannot ${method} ${path}` } });

      if (method === 'GET' && /^\/admin\/v1\/users\/[^/]+\/notifications$/.test(path)) {
        capture.notifications.push(url.search);
        if (options.notDeployed) return notDeployed();
        const cursor = url.searchParams.get('cursor');
        await json(
          route,
          200,
          cursor ? page([V4_NOTIFICATION_UNSENT]) : page([V4_NOTIFICATION], 'n-cursor-1'),
        );
        return;
      }
      if (method === 'GET' && /^\/admin\/v1\/users\/[^/]+\/devices$/.test(path)) {
        capture.devices += 1;
        await json(route, 200, {
          data: [
            {
              app: 'CONSUMER',
              platform: 'ANDROID',
              registeredAt: '2026-10-01T00:00:00.000Z',
              lastSeenAt: '2026-11-02T00:00:00.000Z',
              tokenSuffix: 'a1b2c3',
            },
          ],
          meta: META,
        });
        return;
      }
      if (method === 'GET' && /^\/admin\/v1\/users\/[^/]+\/trips$/.test(path)) {
        capture.trips.push(url.search);
        if (options.notDeployed) return notDeployed();
        await json(route, 200, page([V4_TRIP]));
        return;
      }
      if (method === 'GET' && /^\/admin\/v1\/users\/[^/]+\/driver-score$/.test(path)) {
        capture.driverScore += 1;
        await json(route, 200, {
          data: {
            accountId: HERMETIC_CUSTOMER_ACCOUNT_ID,
            score: 8.4,
            tripCount: 12,
            source: 'DRIVEQUANT',
            disclaimer: 'Hermetic score disclaimer.',
            driveQuant: {
              scale: 10,
              windowDays: 30,
              windowTripCount: 12,
              windowDistanceKm: 240,
              safety: 8.6,
              eco: 7.8,
              distraction: 9,
              speeding: 8.1,
              lastTripAt: '2026-11-01T08:42:00.000Z',
            },
          },
          meta: META,
        });
        return;
      }
      if (method === 'GET' && /^\/admin\/v1\/users\/[^/]+\/driver-invites$/.test(path)) {
        capture.userInvites += 1;
        await json(
          route,
          200,
          page([
            {
              ...V4_INVITE,
              status: 'ACCEPTED',
              inviteeAccountId: HERMETIC_CUSTOMER_ACCOUNT_ID,
              inviteeUsername: 'hermetic_customer',
              resolvedAt: '2026-11-02T09:00:00.000Z',
            },
          ]),
        );
        return;
      }
      const vehicleInvites = path.match(/^\/admin\/v1\/vehicles\/([^/]+)\/driver-invites$/);
      if (method === 'GET' && vehicleInvites) {
        capture.vehicleInvites.push(decodeURIComponent(vehicleInvites[1] ?? ''));
        await json(route, 200, page([V4_INVITE]));
        return;
      }
      if (method === 'DELETE' && /^\/admin\/v1\/users\/[^/]+\/roles\/[^/]+$/.test(path)) {
        capture.roleRevoke.push({ path, body: req.postData() });
        await json(route, 200, {
          data: {
            id: HERMETIC_CUSTOMER_ACCOUNT_ID,
            accountType: 'CONSUMER',
            status: 'ACTIVE',
            locale: 'en-IN',
            fraudFlagged: false,
            createdAt: '2026-10-01T00:00:00.000Z',
            roles: [{ role: 'OPERATOR', scopeRef: null, grantedAt: '2026-10-01T00:00:00.000Z' }],
          },
          meta: META,
        });
        return;
      }
      if (method === 'GET' && path === '/admin/v1/vehicles') {
        capture.plateSearch.push(url.searchParams.get('plate') ?? '');
        if (options.notDeployed) return notDeployed();
        const plate = (url.searchParams.get('plate') ?? '')
          .replace(/[^a-z0-9]/gi, '')
          .toUpperCase();
        await json(route, 200, {
          data: { items: plate === V4_PLATE ? [V4_PLATE_VEHICLE] : [] },
          meta: META,
        });
        return;
      }
      if (method === 'GET' && path === '/admin/v1/scan/lookups') {
        capture.lookups.push(url.search);
        if (options.notDeployed) return notDeployed();
        await json(route, 200, {
          data: {
            items: [
              {
                id: 'abababab-0000-4000-8000-00000000f201',
                createdAt: '2026-11-03T08:00:00.000Z',
                accountId: V4_SCANNER_ID,
                webSessionId: null,
                result: 'MATCH',
                source: 'OCR',
                channel: 'APP',
                score: 12,
                attestation: 'VERIFIED',
                stepUpPassed: null,
                plateHmac: 'f00dfeedcafebabe0123456789',
                vehicleId: V4_VEHICLE_ID,
                ambiguous: false,
                hotPlate: true,
              },
            ],
          },
          meta: META,
        });
        return;
      }
      if (method === 'GET' && path === '/admin/v1/scan/abuse') {
        capture.abuse.push(url.search);
        await json(route, 200, {
          data: {
            scanners: [
              {
                accountId: V4_SCANNER_ID,
                webSessionId: null,
                lookups: 41,
                noMatch: 30,
                stepUps: 2,
                retryLater: 4,
                maxScore: 88,
                distinctPlates: 37,
              },
            ],
            flags: [
              {
                id: V4_FLAG_ID,
                accountId: V4_SCANNER_ID,
                webSessionId: null,
                reason: 'DISTINCT_PLATES',
                score: 88,
                blockedUntil: '2026-11-04T08:00:00.000Z',
                createdAt: '2026-11-03T08:00:00.000Z',
                clearedAt: flagCleared ? '2026-11-03T09:00:00.000Z' : null,
              },
              {
                id: V4_FLAG_CLEARED_ID,
                accountId: null,
                webSessionId: 'abababab-0000-4000-8000-00000000d002',
                reason: 'ABUSE_SCORE',
                score: 75,
                blockedUntil: '2026-11-02T08:00:00.000Z',
                createdAt: '2026-11-01T08:00:00.000Z',
                clearedAt: '2026-11-01T10:00:00.000Z',
              },
            ],
          },
          meta: META,
        });
        return;
      }
      if (method === 'POST' && /^\/admin\/v1\/scan\/flags\/[^/]+\/clear$/.test(path)) {
        capture.flagClear.push({ path, body: req.postData() });
        flagCleared = true;
        await json(route, 200, { data: { cleared: true }, meta: META });
        return;
      }
      if (method === 'GET' && path === '/admin/v1/vehicles/plate-collisions') {
        capture.collisions.push(url.search);
        await json(route, 200, {
          data: {
            items: [
              {
                plateKey: 'MH12QW9087',
                vehicleCount: 2,
                verifiedCount: 0,
                vehicles: [
                  {
                    ...V4_PLATE_VEHICLE,
                    vehicleId: 'v-col-1',
                    registration: 'MH12QW9087',
                    ownershipVerified: false,
                  },
                  {
                    ...V4_PLATE_VEHICLE,
                    vehicleId: 'v-col-2',
                    registration: 'MH 12 QW 9087',
                    ownershipVerified: false,
                    ownerAccountId: V4_SCANNER_ID,
                  },
                ],
              },
            ],
          },
          meta: META,
        });
        return;
      }
      if (method === 'GET' && path === '/admin/v1/vehicles/plate-keys/unparsed') {
        capture.unparsed += 1;
        await json(route, 200, {
          data: { items: backfilled ? [] : [V4_UNKEYED_VEHICLE] },
          meta: META,
        });
        return;
      }
      if (method === 'POST' && path === '/admin/v1/vehicles/plate-keys/backfill') {
        capture.backfill += 1;
        backfilled = true;
        await json(route, 200, {
          data: { processed: 1000, keyed: 998, unparsed: 2, remaining: 0 },
          meta: META,
        });
        return;
      }
      if (method === 'GET' && path === '/admin/v1/subscriptions/active-vehicle-duplicates') {
        capture.duplicates += 1;
        await json(route, 200, {
          data: {
            indexPresent: false,
            duplicates: [
              {
                vehicleId: V4_VEHICLE_ID,
                subscriptionIds: [
                  'abababab-0000-4000-8000-00000000aa01',
                  'abababab-0000-4000-8000-00000000aa02',
                ],
              },
            ],
          },
          meta: META,
        });
        return;
      }
      if (method === 'POST' && path === '/admin/v1/notifications/system') {
        capture.broadcast.push(req.postDataJSON() as unknown);
        const status = options.broadcastStatus ?? 202;
        if (status === 429) {
          await json(route, 429, {
            error: { code: 'rate_limited', message: 'Too many broadcasts' },
          });
          return;
        }
        if (status >= 400) {
          await json(route, status, { error: { code: 'validation', message: 'Bad broadcast' } });
          return;
        }
        await json(route, 202, {
          data: { broadcastId: V4_BROADCAST_ID, queued: 2, skipped: 1 },
          meta: META,
        });
        return;
      }
      await route.fallback();
    },
  );

  return capture;
}
