import type { Page, Route } from '@playwright/test';

/** Synthetic Discovery fixtures only — never real consumer content. */
export const HERMETIC_QA_ID = 'dddddddd-0000-4000-8000-000000000001';
export const HERMETIC_QA_HIDDEN_ID = 'dddddddd-0000-4000-8000-000000000002';
export const HERMETIC_REEL_ID = 'eeeeeeee-0000-4000-8000-000000000001';
export const HERMETIC_REEL_DRAFT_ID = 'eeeeeeee-0000-4000-8000-000000000002';
export const HERMETIC_REEL_NEW_ID = 'eeeeeeee-0000-4000-8000-000000000003';
export const HERMETIC_MEDIA_VIDEO_ID = 'ffffffff-0000-4000-8000-000000000001';
export const HERMETIC_MEDIA_POSTER_ID = 'ffffffff-0000-4000-8000-000000000002';
export const HERMETIC_STORAGE_ORIGIN = 'https://hermetic-storage.invalid';

type Qa = {
  questionId: string;
  authorAccountId: string;
  authorUsername: string;
  kind: string;
  category: string;
  title: string;
  body: string;
  vehicleLabel: string | null;
  answerCount: number;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
};

type Reel = {
  reelId: string;
  stableKey: string;
  title: string;
  caption: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  videoMediaId: string;
  thumbMediaId: string | null;
  playbackUrl: string | null;
  thumbUrl: string | null;
  sortOrder: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Recorded = { method: string; path: string; body: unknown };

export type HermeticDiscoveryCapture = {
  questionsGet: Array<{ query: string }>;
  questionsCreate: Recorded[];
  questionsPatch: Recorded[];
  reelsGet: Array<{ query: string }>;
  reelDetailGet: number;
  reelsCreate: Recorded[];
  reelsPatch: Recorded[];
  reelTransitions: Recorded[];
  mediaRequests: Recorded[];
  mediaPuts: Array<{ url: string; contentType: string | null }>;
  mediaCompletes: string[];
  unexpected: string[];
};

export type InstallHermeticDiscoveryOptions = {
  /** Status for GET /admin/v1/community/{questions,reels}; 404 simulates "not deployed here". */
  listStatus?: number;
  questionsCreateStatus?: number;
  reelsCreateStatus?: number;
};

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

const NOW = '2026-10-20T12:00:00.000Z';

function seedQuestions(): Qa[] {
  return [
    {
      questionId: HERMETIC_QA_ID,
      authorAccountId: 'aaaaaaaa-0000-4000-8000-000000000001',
      authorUsername: 'hermetic_author',
      kind: 'general',
      category: 'maintenance',
      title: 'Hermetic published question',
      body: 'Body of the published question.',
      vehicleLabel: 'Hermetic Swift 2019',
      answerCount: 3,
      status: 'VISIBLE',
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      questionId: HERMETIC_QA_HIDDEN_ID,
      authorAccountId: 'aaaaaaaa-0000-4000-8000-000000000001',
      authorUsername: 'hermetic_author',
      kind: 'problem',
      category: 'tyres',
      title: 'Hermetic hidden question',
      body: '',
      vehicleLabel: null,
      answerCount: 0,
      status: 'HIDDEN',
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
}

function seedReels(): Reel[] {
  return [
    {
      reelId: HERMETIC_REEL_ID,
      stableKey: 'hermetic-reel-01',
      title: 'Hermetic published reel',
      caption: 'Published reel caption',
      status: 'PUBLISHED',
      videoMediaId: HERMETIC_MEDIA_VIDEO_ID,
      thumbMediaId: HERMETIC_MEDIA_POSTER_ID,
      playbackUrl: null,
      thumbUrl: null,
      sortOrder: 1,
      likeCount: 12,
      commentCount: 4,
      bookmarkCount: 2,
      viewCount: 340,
      publishedAt: NOW,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      reelId: HERMETIC_REEL_DRAFT_ID,
      stableKey: 'hermetic-reel-02',
      title: 'Hermetic draft reel',
      caption: '',
      status: 'DRAFT',
      videoMediaId: HERMETIC_MEDIA_VIDEO_ID,
      thumbMediaId: null,
      playbackUrl: null,
      thumbUrl: null,
      sortOrder: 2,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      viewCount: 0,
      publishedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
}

/**
 * Stubs `/admin/v1/community/*` and the `/v1/media` pipeline. Call AFTER `installHermeticApiRoutes` so
 * these handlers win (Playwright runs the most recently registered matching route first).
 */
export async function installHermeticDiscoveryRoutes(
  page: Page,
  options: InstallHermeticDiscoveryOptions = {},
): Promise<HermeticDiscoveryCapture> {
  const listStatus = options.listStatus ?? 200;
  const questionsCreateStatus = options.questionsCreateStatus ?? 201;
  const reelsCreateStatus = options.reelsCreateStatus ?? 201;

  const capture: HermeticDiscoveryCapture = {
    questionsGet: [],
    questionsCreate: [],
    questionsPatch: [],
    reelsGet: [],
    reelDetailGet: 0,
    reelsCreate: [],
    reelsPatch: [],
    reelTransitions: [],
    mediaRequests: [],
    mediaPuts: [],
    mediaCompletes: [],
    unexpected: [],
  };

  let questions = seedQuestions();
  let reels = seedReels();
  let mediaSeq = 0;

  const notDeployed = (route: Route) =>
    fulfillJson(route, 404, errorEnvelope('Cannot GET /admin/v1/community', 'http_404'));

  await page.route('**/admin/v1/community/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    const readBody = () => JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;

    if (method === 'GET' && path === '/admin/v1/community/questions') {
      capture.questionsGet.push({ query: url.search });
      if (listStatus >= 400) {
        await (listStatus === 404
          ? notDeployed(route)
          : fulfillJson(route, listStatus, errorEnvelope('Forbidden', 'forbidden')));
        return;
      }
      const status = url.searchParams.get('status');
      const q = url.searchParams.get('q')?.toLowerCase();
      const rows = questions.filter(
        (row) =>
          (!status || row.status === status) &&
          (!q || row.title.toLowerCase().includes(q) || row.body.toLowerCase().includes(q)),
      );
      await fulfillJson(route, 200, envelope(rows));
      return;
    }

    if (method === 'POST' && path === '/admin/v1/community/questions') {
      const body = readBody();
      capture.questionsCreate.push({ method, path, body });
      if (questionsCreateStatus >= 400) {
        await fulfillJson(route, questionsCreateStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const created: Qa = {
        questionId: 'dddddddd-0000-4000-8000-000000000003',
        authorAccountId: 'aaaaaaaa-0000-4000-8000-000000000009',
        authorUsername: 'hermetic_admin',
        kind: String(body.kind),
        category: String(body.category),
        title: String(body.title),
        body: typeof body.body === 'string' ? body.body : '',
        vehicleLabel: typeof body.vehicleLabel === 'string' ? body.vehicleLabel : null,
        answerCount: 0,
        status: body.status === 'VISIBLE' ? 'VISIBLE' : 'HIDDEN',
        createdAt: NOW,
        updatedAt: NOW,
      };
      questions = [created, ...questions];
      await fulfillJson(route, 201, envelope(created));
      return;
    }

    const questionMatch = path.match(/^\/admin\/v1\/community\/questions\/([^/]+)$/);
    if (questionMatch && method === 'GET') {
      const found = questions.find((row) => row.questionId === questionMatch[1]);
      await (found
        ? fulfillJson(route, 200, envelope(found))
        : fulfillJson(route, 404, errorEnvelope('Not found', 'not_found')));
      return;
    }
    if (questionMatch && method === 'PATCH') {
      const body = readBody();
      capture.questionsPatch.push({ method, path, body });
      const found = questions.find((row) => row.questionId === questionMatch[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const updated = { ...found, ...body, updatedAt: NOW };
      questions = questions.map((row) => (row.questionId === updated.questionId ? updated : row));
      await fulfillJson(route, 200, envelope(updated));
      return;
    }

    if (method === 'GET' && path === '/admin/v1/community/reels') {
      capture.reelsGet.push({ query: url.search });
      if (listStatus >= 400) {
        await (listStatus === 404
          ? notDeployed(route)
          : fulfillJson(route, listStatus, errorEnvelope('Forbidden', 'forbidden')));
        return;
      }
      const status = url.searchParams.get('status');
      const rows = reels.filter((row) => !status || row.status === status);
      await fulfillJson(route, 200, envelope(rows));
      return;
    }

    if (method === 'POST' && path === '/admin/v1/community/reels') {
      const body = readBody();
      capture.reelsCreate.push({ method, path, body });
      if (reelsCreateStatus >= 400) {
        await fulfillJson(route, reelsCreateStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const created: Reel = {
        reelId: HERMETIC_REEL_NEW_ID,
        stableKey: String(body.stableKey),
        title: String(body.title),
        caption: typeof body.caption === 'string' ? body.caption : '',
        status: body.publish === true ? 'PUBLISHED' : 'DRAFT',
        videoMediaId: String(body.videoMediaId),
        thumbMediaId: typeof body.thumbMediaId === 'string' ? body.thumbMediaId : null,
        playbackUrl: null,
        thumbUrl: null,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
        likeCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        viewCount: 0,
        publishedAt: body.publish === true ? NOW : null,
        createdAt: NOW,
        updatedAt: NOW,
      };
      reels = [created, ...reels];
      await fulfillJson(route, 201, envelope(created));
      return;
    }

    const transitionMatch = path.match(
      /^\/admin\/v1\/community\/reels\/([^/]+)\/(publish|unpublish|archive)$/,
    );
    if (method === 'POST' && transitionMatch) {
      capture.reelTransitions.push({ method, path, body: null });
      const found = reels.find((row) => row.reelId === transitionMatch[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const transition = transitionMatch[2];
      const status =
        transition === 'publish' ? 'PUBLISHED' : transition === 'unpublish' ? 'DRAFT' : 'ARCHIVED';
      const updated: Reel = {
        ...found,
        status,
        publishedAt: status === 'PUBLISHED' ? NOW : found.publishedAt,
        updatedAt: NOW,
      };
      reels = reels.map((row) => (row.reelId === updated.reelId ? updated : row));
      await fulfillJson(route, 200, envelope(updated));
      return;
    }

    const reelMatch = path.match(/^\/admin\/v1\/community\/reels\/([^/]+)$/);
    if (reelMatch && method === 'GET') {
      capture.reelDetailGet += 1;
      const found = reels.find((row) => row.reelId === reelMatch[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      await fulfillJson(
        route,
        200,
        envelope({
          ...found,
          playbackUrl: `${HERMETIC_STORAGE_ORIGIN}/play/${found.reelId}.mp4`,
          thumbUrl: found.thumbMediaId
            ? `${HERMETIC_STORAGE_ORIGIN}/thumb/${found.reelId}.png`
            : null,
        }),
      );
      return;
    }
    if (reelMatch && method === 'PATCH') {
      const body = readBody();
      capture.reelsPatch.push({ method, path, body });
      const found = reels.find((row) => row.reelId === reelMatch[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const updated = { ...found, ...body, updatedAt: NOW };
      reels = reels.map((row) => (row.reelId === updated.reelId ? updated : row));
      await fulfillJson(route, 200, envelope(updated));
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled discovery stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  await page.route('**/v1/media**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const method = req.method();

    if (method === 'POST' && path === '/v1/media') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.mediaRequests.push({ method, path, body });
      mediaSeq += 1;
      const mediaId = mediaSeq === 1 ? HERMETIC_MEDIA_VIDEO_ID : HERMETIC_MEDIA_POSTER_ID;
      await fulfillJson(
        route,
        201,
        envelope({
          mediaId,
          upload: {
            url: `${HERMETIC_STORAGE_ORIGIN}/upload/${mediaId}`,
            method: 'PUT',
            headers: { 'Content-Type': String(body.contentType) },
            expiresInSeconds: 300,
          },
        }),
      );
      return;
    }

    const completeMatch = path.match(/^\/v1\/media\/([^/]+)\/complete$/);
    if (method === 'POST' && completeMatch) {
      capture.mediaCompletes.push(decodeURIComponent(completeMatch[1] ?? ''));
      await fulfillJson(
        route,
        200,
        envelope({ mediaId: decodeURIComponent(completeMatch[1] ?? ''), status: 'UPLOADED' }),
      );
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled media stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  await page.route(`${HERMETIC_STORAGE_ORIGIN}/**`, async (route) => {
    const req = route.request();
    if (req.method() === 'PUT') {
      capture.mediaPuts.push({
        url: req.url(),
        contentType: req.headers()['content-type'] ?? null,
      });
      await route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*' },
        body: '',
      });
      return;
    }
    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      ),
    });
  });

  return capture;
}

export async function openDiscoveryOverviewPage(page: Page): Promise<void> {
  await page.goto('/discovery', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Discovery', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

export async function openDiscoveryQaPage(page: Page): Promise<void> {
  await page.goto('/discovery/qa', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Discovery Q&A', exact: true })
    .waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

export async function openDiscoveryReelsPage(page: Page): Promise<void> {
  await page.goto('/discovery/reels', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Discovery Reels', exact: true })
    .waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}
