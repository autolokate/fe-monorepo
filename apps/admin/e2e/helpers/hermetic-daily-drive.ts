import type { Page, Route } from '@playwright/test';

/** Synthetic Daily Drive fixtures only — the ids are not real YouTube videos. */
export const HERMETIC_DD_PUBLISHED_ID = 'abababab-0000-4000-8000-000000000001';
export const HERMETIC_DD_DRAFT_ID = 'abababab-0000-4000-8000-000000000002';
export const HERMETIC_DD_NEW_ID = 'abababab-0000-4000-8000-000000000003';
export const HERMETIC_DD_OTHER_CHANNEL_YOUTUBE = 'https://youtu.be/hermeticXX9';
const HERMETIC_THUMB_ORIGIN = 'https://hermetic-thumbs.invalid';

type Video = {
  videoId: string;
  youtubeVideoId: string;
  channelUrl: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number | null;
  featured: boolean;
  sortOrder: number;
  thumbnailUrl: string;
  watchUrl: string;
  publishedAt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
};

type Recorded = { method: string; path: string; body: unknown };

export type HermeticDailyDriveCapture = {
  listGets: string[];
  creates: Recorded[];
  patches: Recorded[];
  transitions: Recorded[];
  unexpected: string[];
};

export type InstallHermeticDailyDriveOptions = {
  /** 503 + feature_not_provisioned simulates migration 0087 not applied. */
  listStatus?: number;
};

const NOW = '2026-10-20T12:00:00.000Z';

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

function video(
  videoId: string,
  youtubeVideoId: string,
  title: string,
  status: Video['status'],
): Video {
  return {
    videoId,
    youtubeVideoId,
    channelUrl: 'https://www.youtube.com/@IndianDriveGuide',
    title,
    description: '',
    category: 'driving',
    durationMinutes: 8,
    featured: false,
    sortOrder: 1,
    thumbnailUrl: `${HERMETIC_THUMB_ORIGIN}/${youtubeVideoId}.png`,
    watchUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
    publishedAt: status === 'PUBLISHED' ? NOW : null,
    status,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export async function installHermeticDailyDriveRoutes(
  page: Page,
  options: InstallHermeticDailyDriveOptions = {},
): Promise<HermeticDailyDriveCapture> {
  const capture: HermeticDailyDriveCapture = {
    listGets: [],
    creates: [],
    patches: [],
    transitions: [],
    unexpected: [],
  };
  let videos: Video[] = [
    video(HERMETIC_DD_PUBLISHED_ID, 'hermeticAA1', 'Hermetic published video', 'PUBLISHED'),
    video(HERMETIC_DD_DRAFT_ID, 'hermeticBB2', 'Hermetic draft video', 'DRAFT'),
  ];

  await page.route('**/admin/v1/daily-drive/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    const readBody = () => JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;

    if (method === 'GET' && path === '/admin/v1/daily-drive/videos') {
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
      await fulfillJson(
        route,
        200,
        envelope(videos.filter((row) => !status || row.status === status)),
      );
      return;
    }

    if (method === 'POST' && path === '/admin/v1/daily-drive/videos') {
      const body = readBody();
      capture.creates.push({ method, path, body });
      if (body.youtube === HERMETIC_DD_OTHER_CHANNEL_YOUTUBE) {
        await fulfillJson(
          route,
          422,
          errorEnvelope('Video is not from an approved channel', 'youtube_channel_not_allowed'),
        );
        return;
      }
      const created: Video = {
        ...video(
          HERMETIC_DD_NEW_ID,
          'hermeticCC3',
          typeof body.title === 'string' ? body.title : 'Hermetic YouTube title',
          body.publish === true ? 'PUBLISHED' : 'DRAFT',
        ),
        category: String(body.category),
      };
      videos = [created, ...videos];
      await fulfillJson(route, 201, envelope(created));
      return;
    }

    const transitionMatch = path.match(
      /^\/admin\/v1\/daily-drive\/videos\/([^/]+)\/(publish|unpublish|archive)$/,
    );
    if (method === 'POST' && transitionMatch) {
      capture.transitions.push({ method, path, body: null });
      const found = videos.find((row) => row.videoId === transitionMatch[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const status =
        transitionMatch[2] === 'publish'
          ? 'PUBLISHED'
          : transitionMatch[2] === 'unpublish'
            ? 'DRAFT'
            : 'ARCHIVED';
      const updated: Video = {
        ...found,
        status,
        publishedAt: status === 'PUBLISHED' ? NOW : found.publishedAt,
      };
      videos = videos.map((row) => (row.videoId === updated.videoId ? updated : row));
      await fulfillJson(route, 200, envelope(updated));
      return;
    }

    const videoMatch = path.match(/^\/admin\/v1\/daily-drive\/videos\/([^/]+)$/);
    if (method === 'PATCH' && videoMatch) {
      const body = readBody();
      capture.patches.push({ method, path, body });
      const found = videos.find((row) => row.videoId === videoMatch[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const updated: Video = { ...found, ...body, updatedAt: NOW };
      videos = videos.map((row) => (row.videoId === updated.videoId ? updated : row));
      await fulfillJson(route, 200, envelope(updated));
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled daily drive stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  await page.route(`${HERMETIC_THUMB_ORIGIN}/**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      ),
    });
  });

  return capture;
}

export async function openDailyDrivePage(page: Page): Promise<void> {
  await page.goto('/discovery/daily-drive', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Daily Drive', exact: true })
    .waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}
