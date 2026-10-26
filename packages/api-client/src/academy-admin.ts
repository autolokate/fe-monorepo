import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/**
 * Admin Academy — Nest `/admin/v1/academy/*`, OPERATOR plane. Courses group channel-verified
 * YouTube lessons; consumers read PUBLISHED courses with at least one PUBLISHED lesson, and only
 * accounts with an ACTIVE subscription receive lesson video ids (`GET /v1/academy/*`).
 */

export const ACADEMY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type AcademyLevel = (typeof ACADEMY_LEVELS)[number];

export const ACADEMY_LANGUAGES = ['en', 'hi'] as const;
export type AcademyLanguage = (typeof ACADEMY_LANGUAGES)[number];

export type AdminAcademyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AdminAcademyTransition = 'publish' | 'unpublish' | 'archive';

export type AdminAcademyLessonDto = {
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
  status: AdminAcademyStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type AdminAcademyCourseDto = {
  courseId: string;
  title: string;
  tagline: string;
  description: string;
  level: AcademyLevel;
  language: AcademyLanguage;
  featured: boolean;
  sortOrder: number;
  status: AdminAcademyStatus;
  lessonCount: number;
  publishedLessonCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAcademyCourseDetailDto = AdminAcademyCourseDto & {
  lessons: AdminAcademyLessonDto[];
};

export type CreateAdminAcademyCourseBody = {
  title: string;
  tagline?: string;
  description?: string;
  level: AcademyLevel;
  language?: AcademyLanguage;
  featured?: boolean;
  sortOrder?: number;
};

export type UpdateAdminAcademyCourseBody = Partial<CreateAdminAcademyCourseBody>;

export type CreateAdminAcademyLessonBody = {
  /** YouTube URL (watch, youtu.be, shorts, embed) or bare 11-char id. */
  youtube: string;
  /** Defaults to the YouTube title. */
  title?: string;
  description?: string;
  takeaways?: string[];
  durationMinutes?: number;
  sortOrder?: number;
  /** Create as PUBLISHED instead of DRAFT. */
  publish?: boolean;
};

export type UpdateAdminAcademyLessonBody = {
  title?: string;
  description?: string;
  takeaways?: string[];
  /** `null` clears the duration. */
  durationMinutes?: number | null;
  sortOrder?: number;
};

type RequestOptions = { signal?: AbortSignal };

function signalOption(options: RequestOptions): RequestOptions {
  return options.signal ? { signal: options.signal } : {};
}

/** GET /admin/v1/academy/courses */
export async function listAdminAcademyCourses(
  client: ApiClient,
  query: { status?: AdminAcademyStatus } = {},
  options: RequestOptions = {},
): Promise<AdminAcademyCourseDto[]> {
  const qs = query.status ? `?status=${encodeURIComponent(query.status)}` : '';
  const response = await client.get<unknown>(
    `${endpoints.admin.academyCourses}${qs}`,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyCourseDto[];
}

/** GET /admin/v1/academy/courses/{id} */
export async function getAdminAcademyCourse(
  client: ApiClient,
  courseId: string,
  options: RequestOptions = {},
): Promise<AdminAcademyCourseDetailDto> {
  const response = await client.get<unknown>(
    endpoints.admin.academyCourse(courseId),
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyCourseDetailDto;
}

/** POST /admin/v1/academy/courses — created as DRAFT. */
export async function createAdminAcademyCourse(
  client: ApiClient,
  body: CreateAdminAcademyCourseBody,
  options: RequestOptions = {},
): Promise<AdminAcademyCourseDetailDto> {
  const response = await client.post<unknown>(
    endpoints.admin.academyCourses,
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyCourseDetailDto;
}

/** PATCH /admin/v1/academy/courses/{id} */
export async function updateAdminAcademyCourse(
  client: ApiClient,
  courseId: string,
  body: UpdateAdminAcademyCourseBody,
  options: RequestOptions = {},
): Promise<AdminAcademyCourseDetailDto> {
  const response = await client.patch<unknown>(
    endpoints.admin.academyCourse(courseId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyCourseDetailDto;
}

/** POST /admin/v1/academy/courses/{id}/publish|unpublish|archive — 422 academy_course_empty. */
export async function transitionAdminAcademyCourse(
  client: ApiClient,
  courseId: string,
  transition: AdminAcademyTransition,
  options: RequestOptions = {},
): Promise<AdminAcademyCourseDetailDto> {
  const response = await client.post<unknown>(
    endpoints.admin.academyCourseTransition(courseId, transition),
    undefined,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyCourseDetailDto;
}

/**
 * POST /admin/v1/academy/courses/{id}/lessons — 409 academy_lesson_exists,
 * 422 youtube_channel_not_allowed.
 */
export async function createAdminAcademyLesson(
  client: ApiClient,
  courseId: string,
  body: CreateAdminAcademyLessonBody,
  options: RequestOptions = {},
): Promise<AdminAcademyLessonDto> {
  const response = await client.post<unknown>(
    endpoints.admin.academyCourseLessons(courseId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyLessonDto;
}

/** PATCH /admin/v1/academy/lessons/{id} */
export async function updateAdminAcademyLesson(
  client: ApiClient,
  lessonId: string,
  body: UpdateAdminAcademyLessonBody,
  options: RequestOptions = {},
): Promise<AdminAcademyLessonDto> {
  const response = await client.patch<unknown>(
    endpoints.admin.academyLesson(lessonId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyLessonDto;
}

/** POST /admin/v1/academy/lessons/{id}/publish|unpublish|archive */
export async function transitionAdminAcademyLesson(
  client: ApiClient,
  lessonId: string,
  transition: AdminAcademyTransition,
  options: RequestOptions = {},
): Promise<AdminAcademyLessonDto> {
  const response = await client.post<unknown>(
    endpoints.admin.academyLessonTransition(lessonId, transition),
    undefined,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminAcademyLessonDto;
}
