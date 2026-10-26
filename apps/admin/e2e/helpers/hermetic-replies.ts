import type { Page, Route } from '@playwright/test';

/** Synthetic reply fixtures for `/admin/v1/community/replies*`. */
export const HERMETIC_REPLY_VISIBLE_ID = 'cdcdcdcd-0000-4000-8000-000000000001';
export const HERMETIC_REPLY_HIDDEN_ID = 'cdcdcdcd-0000-4000-8000-000000000002';

type Reply = {
  replyId: string;
  answerId: string;
  questionId: string;
  authorAccountId: string;
  authorUsername: string | null;
  questionTitle: string;
  body: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
};

type Recorded = { method: string; path: string; body: unknown };

export type HermeticRepliesCapture = {
  listGets: string[];
  patches: Recorded[];
  unexpected: string[];
};

export type InstallHermeticRepliesOptions = {
  /** 503 + feature_not_provisioned simulates migration 0087 not applied. */
  listStatus?: number;
};

const NOW = '2026-10-26T12:00:00.000Z';

function envelope<T>(data: T) {
  return { data, meta: { requestId: 'hermetic-req', correlationId: 'hermetic-corr' } };
}

function errorEnvelope(message: string, code: string) {
  return {
    error: { code, message, requestId: 'hermetic-req', correlationId: 'hermetic-corr' },
  };
}

async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

function reply(replyId: string, body: string, status: Reply['status']): Reply {
  return {
    replyId,
    answerId: 'cdcdcdcd-1111-4000-8000-000000000001',
    questionId: 'cdcdcdcd-2222-4000-8000-000000000001',
    authorAccountId: 'cdcdcdcd-3333-4000-8000-000000000001',
    authorUsername: 'hermetic_driver',
    questionTitle: 'Hermetic brake squeal question',
    body,
    status,
    createdAt: NOW,
  };
}

export async function installHermeticRepliesRoutes(
  page: Page,
  options: InstallHermeticRepliesOptions = {},
): Promise<HermeticRepliesCapture> {
  const capture: HermeticRepliesCapture = { listGets: [], patches: [], unexpected: [] };
  let replies: Reply[] = [
    reply(HERMETIC_REPLY_VISIBLE_ID, 'Hermetic visible reply about pads', 'VISIBLE'),
    reply(HERMETIC_REPLY_HIDDEN_ID, 'Hermetic hidden reply with spam', 'HIDDEN'),
  ];

  await page.route('**/admin/v1/community/replies**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (method === 'GET' && path === '/admin/v1/community/replies') {
      capture.listGets.push(url.search);
      if (options.listStatus && options.listStatus >= 400) {
        await fulfillJson(
          route,
          options.listStatus,
          errorEnvelope('Not provisioned', 'feature_not_provisioned'),
        );
        return;
      }
      const status = url.searchParams.get('status');
      const q = url.searchParams.get('q')?.toLowerCase();
      await fulfillJson(
        route,
        200,
        envelope(
          replies.filter(
            (row) =>
              (!status || row.status === status) && (!q || row.body.toLowerCase().includes(q)),
          ),
        ),
      );
      return;
    }

    const match = path.match(/^\/admin\/v1\/community\/replies\/([^/]+)$/);
    if (method === 'PATCH' && match) {
      const body = JSON.parse(req.postData() ?? '{}') as { status?: Reply['status'] };
      capture.patches.push({ method, path, body });
      const found = replies.find((row) => row.replyId === match[1]);
      if (!found || !body.status) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const updated: Reply = { ...found, status: body.status };
      replies = replies.map((row) => (row.replyId === updated.replyId ? updated : row));
      await fulfillJson(route, 200, envelope(updated));
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled replies stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  return capture;
}

export async function openRepliesPage(page: Page): Promise<void> {
  await page.goto('/discovery/replies', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Q&A replies', exact: true })
    .waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}
