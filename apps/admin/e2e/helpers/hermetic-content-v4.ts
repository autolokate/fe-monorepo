import type { Page, Route } from '@playwright/test';

/** Synthetic fixtures for comment moderation + roadside assistance — never real accounts. */
export const HERMETIC_COMMENT_ID = 'c0c0c0c0-0000-4000-8000-000000000001';
export const HERMETIC_COMMENT_HIDDEN_ID = 'c0c0c0c0-0000-4000-8000-000000000002';
export const HERMETIC_COMMENT_REEL_ID = 'c0c0c0c0-0000-4000-8000-0000000000aa';
export const HERMETIC_COMMENT_ORG_ID = 'c0c0c0c0-0000-4000-8000-0000000000bb';
export const HERMETIC_RAS_ID = 'a5a5a5a5-0000-4000-8000-000000000001';
export const HERMETIC_RAS_ACCOUNT_ID = 'a5a5a5a5-0000-4000-8000-0000000000aa';

const NOW = '2026-11-02T10:00:00.000Z';
const META = { requestId: 'hermetic-req', correlationId: 'hermetic-corr' };

async function json(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

function page<T>(data: T[], nextCursor: string | null = null) {
  return {
    data,
    meta: {
      ...META,
      pagination: { limit: 50, cursor: null, nextCursor, hasMore: nextCursor !== null },
    },
  };
}

export function hermeticComment(overrides: Record<string, unknown> = {}) {
  return {
    id: HERMETIC_COMMENT_ID,
    reelId: HERMETIC_COMMENT_REEL_ID,
    reelTitle: 'Hermetic brake pad swap',
    partnerOrgId: HERMETIC_COMMENT_ORG_ID,
    parentCommentId: null,
    authorAccountId: 'c0c0c0c0-0000-4000-8000-0000000000cc',
    authorUsername: 'hermetic.viewer',
    body: 'Great job @hermetic.garage — what pads did you use?',
    mentions: ['hermetic.garage'],
    status: 'VISIBLE',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

export type HermeticCommentsCapture = {
  listQueries: URLSearchParams[];
  patches: Array<{ id: string; body: Record<string, unknown> }>;
};

/** `/admin/v1/community/comments*` — list (with a second page) and PATCH moderation. */
export async function installHermeticCommentsRoutes(
  target: Page,
  options: { listStatus?: number } = {},
): Promise<HermeticCommentsCapture> {
  const capture: HermeticCommentsCapture = { listQueries: [], patches: [] };
  const rows = new Map<string, ReturnType<typeof hermeticComment>>([
    [HERMETIC_COMMENT_ID, hermeticComment()],
    [
      HERMETIC_COMMENT_HIDDEN_ID,
      hermeticComment({
        id: HERMETIC_COMMENT_HIDDEN_ID,
        parentCommentId: HERMETIC_COMMENT_ID,
        partnerOrgId: null,
        authorUsername: 'hermetic.spammer',
        body: 'Buy cheap followers now',
        mentions: [],
        status: 'HIDDEN',
      }),
    ],
  ]);
  await target.route(/\/admin\/v1\/community\/comments/, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() === 'GET' && url.pathname === '/admin/v1/community/comments') {
      capture.listQueries.push(url.searchParams);
      if ((options.listStatus ?? 200) >= 400) {
        await json(route, options.listStatus ?? 500, {
          error: { code: 'not_found', message: `Cannot GET ${url.pathname}` },
        });
        return;
      }
      const status = url.searchParams.get('status');
      const filtered = [...rows.values()].filter((row) => !status || row.status === status);
      await json(route, 200, page(filtered));
      return;
    }
    const patch = url.pathname.match(/^\/admin\/v1\/community\/comments\/([^/]+)$/);
    if (req.method() === 'PATCH' && patch) {
      const id = decodeURIComponent(patch[1] ?? '');
      const body = req.postDataJSON() as Record<string, unknown>;
      capture.patches.push({ id, body });
      const current = rows.get(id);
      if (!current) {
        await json(route, 404, { error: { code: 'not_found', message: 'No such comment' } });
        return;
      }
      const next = { ...current, status: body.status as string, updatedAt: NOW };
      rows.set(id, next);
      await json(route, 200, { data: next, meta: META });
      return;
    }
    await json(route, 404, {
      error: { code: 'not_found', message: `Cannot ${req.method()} ${url.pathname}` },
    });
  });
  return capture;
}

export function hermeticRasRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: HERMETIC_RAS_ID,
    status: 'Provider en route',
    statusCode: 'EN_ROUTE',
    issueType: 'FLAT_TYRE',
    vehicleId: 'a5a5a5a5-0000-4000-8000-0000000000bb',
    vehicleLabel: 'Hermetic Creta',
    locationLabel: 'Hermetic Road, Bengaluru',
    latitude: 12.93456,
    longitude: 77.61234,
    detail: 'Front left tyre flat near the signal.',
    providerId: 'a5a5a5a5-0000-4000-8000-0000000000cc',
    providerName: 'Hermetic Towing',
    etaMinutes: 18,
    createdAt: NOW,
    updatedAt: NOW,
    accountId: HERMETIC_RAS_ACCOUNT_ID,
    ...overrides,
  };
}

export type HermeticRasCapture = {
  listQueries: URLSearchParams[];
  detail: string[];
  writes: string[];
};

/** `/admin/v1/services/ras/requests*` — list + detail; any write is recorded (the UI must not send one). */
export async function installHermeticRasRoutes(
  target: Page,
  options: { listStatus?: number } = {},
): Promise<HermeticRasCapture> {
  const capture: HermeticRasCapture = { listQueries: [], detail: [], writes: [] };
  await target.route(/\/admin\/v1\/services\/ras\/requests/, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() !== 'GET') {
      capture.writes.push(`${req.method()} ${url.pathname}`);
      await json(route, 405, { error: { code: 'validation', message: 'read-only in hermetic' } });
      return;
    }
    if (url.pathname === '/admin/v1/services/ras/requests') {
      capture.listQueries.push(url.searchParams);
      if ((options.listStatus ?? 200) >= 400) {
        await json(route, options.listStatus ?? 500, {
          error: { code: 'not_found', message: `Cannot GET ${url.pathname}` },
        });
        return;
      }
      const status = url.searchParams.get('status');
      const all = [
        hermeticRasRequest(),
        hermeticRasRequest({
          id: 'a5a5a5a5-0000-4000-8000-000000000002',
          status: 'Completed',
          statusCode: 'COMPLETED',
          issueType: 'BATTERY',
          vehicleLabel: 'Hermetic Nexon',
          etaMinutes: null,
        }),
      ];
      await json(route, 200, page(all.filter((row) => !status || row.statusCode === status)));
      return;
    }
    const detail = url.pathname.match(/^\/admin\/v1\/services\/ras\/requests\/([^/]+)$/);
    if (detail) {
      capture.detail.push(decodeURIComponent(detail[1] ?? ''));
      await json(route, 200, { data: hermeticRasRequest(), meta: META });
      return;
    }
    await json(route, 404, { error: { code: 'not_found', message: `Cannot GET ${url.pathname}` } });
  });
  return capture;
}
