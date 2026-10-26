import {
  ApiError,
  createAdminAcademyCourse,
  createAdminAcademyLesson,
  getAdminAcademyCourse,
  listAdminAcademyCourses,
  transitionAdminAcademyCourse,
  transitionAdminAcademyLesson,
  updateAdminAcademyCourse,
  updateAdminAcademyLesson,
  type AdminAcademyCourseDetailDto,
  type AdminAcademyCourseDto,
  type AdminAcademyLessonDto,
  type AdminAcademyStatus,
  type AdminAcademyTransition,
  type CreateAdminAcademyCourseBody,
  type CreateAdminAcademyLessonBody,
  type UpdateAdminAcademyCourseBody,
  type UpdateAdminAcademyLessonBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import {
  describeDiscoveryReadError,
  describeDiscoverySubmitError,
} from '@/services/discovery/discovery-errors';

const NOT_PROVISIONED_MESSAGE =
  'Academy is not provisioned on this environment yet (database migration 0089 pending).';

function hasCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code === code;
}

export function describeAcademyReadError(error: unknown): string {
  return hasCode(error, 'feature_not_provisioned')
    ? NOT_PROVISIONED_MESSAGE
    : describeDiscoveryReadError(error);
}

export function describeAcademySubmitError(error: unknown): string {
  if (hasCode(error, 'feature_not_provisioned')) {
    return NOT_PROVISIONED_MESSAGE;
  }
  if (hasCode(error, 'youtube_channel_not_allowed')) {
    return 'That video is not from an approved channel. Academy only accepts Indian Drive Guide uploads.';
  }
  if (hasCode(error, 'academy_lesson_exists')) {
    return 'That video is already a lesson in this course.';
  }
  if (hasCode(error, 'academy_course_empty')) {
    return 'Publish at least one lesson before publishing the course.';
  }
  return describeDiscoverySubmitError(error);
}

/** GET /admin/v1/academy/courses */
export function fetchAcademyCourses(
  status: AdminAcademyStatus | undefined,
  signal?: AbortSignal,
): Promise<AdminAcademyCourseDto[]> {
  return listAdminAcademyCourses(getAdminApiClient(), { status }, { signal });
}

/** GET /admin/v1/academy/courses/{id} */
export function fetchAcademyCourse(
  courseId: string,
  signal?: AbortSignal,
): Promise<AdminAcademyCourseDetailDto> {
  return getAdminAcademyCourse(getAdminApiClient(), courseId, { signal });
}

export function createAcademyCourse(
  body: CreateAdminAcademyCourseBody,
): Promise<AdminAcademyCourseDetailDto> {
  return createAdminAcademyCourse(getAdminApiClient(), body);
}

export function updateAcademyCourse(
  courseId: string,
  body: UpdateAdminAcademyCourseBody,
): Promise<AdminAcademyCourseDetailDto> {
  return updateAdminAcademyCourse(getAdminApiClient(), courseId, body);
}

export function transitionAcademyCourse(
  courseId: string,
  transition: AdminAcademyTransition,
): Promise<AdminAcademyCourseDetailDto> {
  return transitionAdminAcademyCourse(getAdminApiClient(), courseId, transition);
}

/** POST /admin/v1/academy/courses/{id}/lessons — Nest verifies the IDG channel before saving. */
export function createAcademyLesson(
  courseId: string,
  body: CreateAdminAcademyLessonBody,
): Promise<AdminAcademyLessonDto> {
  return createAdminAcademyLesson(getAdminApiClient(), courseId, body);
}

export function updateAcademyLesson(
  lessonId: string,
  body: UpdateAdminAcademyLessonBody,
): Promise<AdminAcademyLessonDto> {
  return updateAdminAcademyLesson(getAdminApiClient(), lessonId, body);
}

export function transitionAcademyLesson(
  lessonId: string,
  transition: AdminAcademyTransition,
): Promise<AdminAcademyLessonDto> {
  return transitionAdminAcademyLesson(getAdminApiClient(), lessonId, transition);
}
