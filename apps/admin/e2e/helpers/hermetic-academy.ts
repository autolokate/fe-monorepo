import type { Page, Route } from '@playwright/test';

/** Synthetic Academy fixtures only — the YouTube ids are not real videos. */
export const HERMETIC_ACADEMY_COURSE_ID = 'acacacac-0000-4000-8000-000000000001';
export const HERMETIC_ACADEMY_NEW_COURSE_ID = 'acacacac-0000-4000-8000-000000000002';
export const HERMETIC_ACADEMY_DRAFT_LESSON_ID = 'acacacac-0000-4000-8000-0000000000a1';
export const HERMETIC_ACADEMY_NEW_LESSON_ID = 'acacacac-0000-4000-8000-0000000000a2';
export const HERMETIC_ACADEMY_OTHER_CHANNEL_YOUTUBE = 'https://youtu.be/hermeticXX9';

type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

type Lesson = {
  lessonId: string;
  courseId: string;
  title: string;
  description: string;
  takeaways: string[];
  youtubeVideoId: string;
  channelUrl: string;
  thumbnailUrl: string;
  durationMinutes: number | null;
  sortOrder: number;
  status: Status;
  publishedAt: string | null;
  updatedAt: string;
};

type Course = {
  courseId: string;
  title: string;
  tagline: string;
  description: string;
  level: string;
  language: string;
  featured: boolean;
  sortOrder: number;
  status: Status;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Recorded = { method: string; path: string; body: unknown };

export type HermeticAcademyCapture = {
  courseCreates: Recorded[];
  lessonCreates: Recorded[];
  transitions: Recorded[];
  unexpected: string[];
};

const NOW = '2026-10-26T12:00:00.000Z';
const THUMB_ORIGIN = 'https://hermetic-thumbs.invalid';

function envelope<T>(data: T) {
  return { data, meta: { requestId: 'hermetic-req', correlationId: 'hermetic-corr' } };
}

function errorEnvelope(message: string, code: string) {
  return { error: { code, message, requestId: 'hermetic-req', correlationId: 'hermetic-corr' } };
}

async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

function lesson(lessonId: string, youtubeVideoId: string, title: string, status: Status): Lesson {
  return {
    lessonId,
    courseId: HERMETIC_ACADEMY_COURSE_ID,
    title,
    description: '',
    takeaways: [],
    youtubeVideoId,
    channelUrl: 'https://www.youtube.com/@IndianDriveGuide',
    thumbnailUrl: `${THUMB_ORIGIN}/${youtubeVideoId}.png`,
    durationMinutes: null,
    sortOrder: 0,
    status,
    publishedAt: status === 'PUBLISHED' ? NOW : null,
    updatedAt: NOW,
  };
}

export async function installHermeticAcademyRoutes(page: Page): Promise<HermeticAcademyCapture> {
  const capture: HermeticAcademyCapture = {
    courseCreates: [],
    lessonCreates: [],
    transitions: [],
    unexpected: [],
  };
  let courses: Course[] = [
    {
      courseId: HERMETIC_ACADEMY_COURSE_ID,
      title: 'Hermetic driving basics',
      tagline: 'Synthetic course',
      description: '',
      level: 'beginner',
      language: 'hi',
      featured: true,
      sortOrder: 0,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
  let lessons: Lesson[] = [
    lesson(HERMETIC_ACADEMY_DRAFT_LESSON_ID, 'hermeticAA1', 'Hermetic lesson one', 'DRAFT'),
  ];

  const summary = (course: Course) => {
    const own = lessons.filter((row) => row.courseId === course.courseId);
    return {
      ...course,
      lessonCount: own.length,
      publishedLessonCount: own.filter((row) => row.status === 'PUBLISHED').length,
    };
  };
  const detail = (course: Course) => ({
    ...summary(course),
    lessons: lessons.filter((row) => row.courseId === course.courseId),
  });

  await page.route('**/admin/v1/academy/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    const readBody = () => JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;

    if (method === 'GET' && path === '/admin/v1/academy/courses') {
      const status = url.searchParams.get('status');
      await fulfillJson(
        route,
        200,
        envelope(courses.filter((row) => !status || row.status === status).map(summary)),
      );
      return;
    }

    if (method === 'POST' && path === '/admin/v1/academy/courses') {
      const body = readBody();
      capture.courseCreates.push({ method, path, body });
      const created: Course = {
        courseId: HERMETIC_ACADEMY_NEW_COURSE_ID,
        title: String(body.title),
        tagline: typeof body.tagline === 'string' ? body.tagline : '',
        description: '',
        level: String(body.level),
        language: typeof body.language === 'string' ? body.language : 'en',
        featured: body.featured === true,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
        status: 'DRAFT',
        publishedAt: null,
        createdAt: NOW,
        updatedAt: NOW,
      };
      courses = [...courses, created];
      await fulfillJson(route, 201, envelope(detail(created)));
      return;
    }

    const courseTransition = path.match(
      /^\/admin\/v1\/academy\/courses\/([^/]+)\/(publish|unpublish|archive)$/,
    );
    if (method === 'POST' && courseTransition) {
      capture.transitions.push({ method, path, body: null });
      const found = courses.find((row) => row.courseId === courseTransition[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const verb = courseTransition[2];
      if (verb === 'publish' && summary(found).publishedLessonCount === 0) {
        await fulfillJson(
          route,
          422,
          errorEnvelope('Publish at least one lesson first.', 'academy_course_empty'),
        );
        return;
      }
      const status: Status =
        verb === 'publish' ? 'PUBLISHED' : verb === 'unpublish' ? 'DRAFT' : 'ARCHIVED';
      const updated: Course = {
        ...found,
        status,
        publishedAt: status === 'PUBLISHED' ? NOW : found.publishedAt,
      };
      courses = courses.map((row) => (row.courseId === updated.courseId ? updated : row));
      await fulfillJson(route, 200, envelope(detail(updated)));
      return;
    }

    const courseLessons = path.match(/^\/admin\/v1\/academy\/courses\/([^/]+)\/lessons$/);
    if (method === 'POST' && courseLessons) {
      const body = readBody();
      capture.lessonCreates.push({ method, path, body });
      if (body.youtube === HERMETIC_ACADEMY_OTHER_CHANNEL_YOUTUBE) {
        await fulfillJson(
          route,
          422,
          errorEnvelope('Video is not from an approved channel', 'youtube_channel_not_allowed'),
        );
        return;
      }
      const created: Lesson = {
        ...lesson(
          HERMETIC_ACADEMY_NEW_LESSON_ID,
          'hermeticCC3',
          typeof body.title === 'string' ? body.title : 'Hermetic YouTube title',
          body.publish === true ? 'PUBLISHED' : 'DRAFT',
        ),
        courseId: courseLessons[1] ?? HERMETIC_ACADEMY_COURSE_ID,
        takeaways: Array.isArray(body.takeaways) ? (body.takeaways as string[]) : [],
      };
      lessons = [...lessons, created];
      await fulfillJson(route, 201, envelope(created));
      return;
    }

    const courseMatch = path.match(/^\/admin\/v1\/academy\/courses\/([^/]+)$/);
    if (method === 'GET' && courseMatch) {
      const found = courses.find((row) => row.courseId === courseMatch[1]);
      await (found
        ? fulfillJson(route, 200, envelope(detail(found)))
        : fulfillJson(route, 404, errorEnvelope('Not found', 'not_found')));
      return;
    }

    const lessonTransition = path.match(
      /^\/admin\/v1\/academy\/lessons\/([^/]+)\/(publish|unpublish|archive)$/,
    );
    if (method === 'POST' && lessonTransition) {
      capture.transitions.push({ method, path, body: null });
      const found = lessons.find((row) => row.lessonId === lessonTransition[1]);
      if (!found) {
        await fulfillJson(route, 404, errorEnvelope('Not found', 'not_found'));
        return;
      }
      const verb = lessonTransition[2];
      const status: Status =
        verb === 'publish' ? 'PUBLISHED' : verb === 'unpublish' ? 'DRAFT' : 'ARCHIVED';
      const updated: Lesson = {
        ...found,
        status,
        publishedAt: status === 'PUBLISHED' ? NOW : found.publishedAt,
      };
      lessons = lessons.map((row) => (row.lessonId === updated.lessonId ? updated : row));
      await fulfillJson(route, 200, envelope(updated));
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled academy stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  await page.route(`${THUMB_ORIGIN}/**`, async (route) => {
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

export async function openAcademyPage(page: Page): Promise<void> {
  await page.goto('/discovery/academy', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Academy', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}
