import type {
  AdminAcademyStatus,
  AdminAcademyTransition,
  CreateAdminAcademyCourseBody,
  CreateAdminAcademyLessonBody,
  UpdateAdminAcademyCourseBody,
  UpdateAdminAcademyLessonBody,
} from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { discoveryQueryKeys } from '@/hooks/discovery/discovery-query-keys';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showErrorToast, showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  createAcademyCourse,
  createAcademyLesson,
  describeAcademyReadError,
  describeAcademySubmitError,
  fetchAcademyCourse,
  fetchAcademyCourses,
  transitionAcademyCourse,
  transitionAcademyLesson,
  updateAcademyCourse,
  updateAcademyLesson,
} from '@/services/discovery/admin-academy-service';

export type AcademyStatusFilter = AdminAcademyStatus | 'ALL';

const academyKey = () => [...discoveryQueryKeys.all, 'academy'] as const;

const TRANSITION_DONE: Record<AdminAcademyTransition, string> = {
  publish: 'is live in the consumer Academy.',
  unpublish: 'is back to draft.',
  archive: 'is archived.',
};

export function useAcademyCourses() {
  const canRead = useAdminPermission('discovery:read');
  const [status, setStatus] = useState<AcademyStatusFilter>('ALL');

  const query = useQuery({
    queryKey: [...academyKey(), 'courses', status] as const,
    queryFn: ({ signal }) => fetchAcademyCourses(status === 'ALL' ? undefined : status, signal),
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load Academy courses.' },
  });

  return {
    ...query,
    courses: query.data ?? [],
    status,
    setStatus,
    userErrorMessage: query.isError ? describeAcademyReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useAcademyCourse(courseId: string | null) {
  const canRead = useAdminPermission('discovery:read');
  const query = useQuery({
    queryKey: [...academyKey(), 'course', courseId] as const,
    queryFn: ({ signal }) => fetchAcademyCourse(courseId ?? '', signal),
    enabled: canRead && courseId !== null,
    retry: false,
    meta: { errorMessage: 'Unable to load the course.' },
  });
  return {
    ...query,
    userErrorMessage: query.isError ? describeAcademyReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useAcademyMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: academyKey() });
  const reportTransitionError = (error: unknown) => {
    reportAdminApiError(error, { context: 'discovery:academy-transition', toast: false });
    showErrorToast(describeAcademySubmitError(error));
  };

  const createCourse = useMutation({
    mutationFn: (body: CreateAdminAcademyCourseBody) => createAcademyCourse(body),
    retry: 0,
    onSuccess: async (course) => {
      await invalidate();
      showSuccessToast(`Created "${course.title}" as a draft. Add lessons, then publish.`);
    },
  });

  const updateCourse = useMutation({
    mutationFn: ({ courseId, body }: { courseId: string; body: UpdateAdminAcademyCourseBody }) =>
      updateAcademyCourse(courseId, body),
    retry: 0,
    onSuccess: async (course) => {
      await invalidate();
      showSuccessToast(`Saved "${course.title}".`);
    },
  });

  const transitionCourse = useMutation({
    mutationFn: ({
      courseId,
      transition,
    }: {
      courseId: string;
      transition: AdminAcademyTransition;
    }) => transitionAcademyCourse(courseId, transition),
    retry: 0,
    onSuccess: async (course, variables) => {
      await invalidate();
      showSuccessToast(`"${course.title}" ${TRANSITION_DONE[variables.transition]}`);
    },
    onError: reportTransitionError,
  });

  const createLesson = useMutation({
    mutationFn: ({ courseId, body }: { courseId: string; body: CreateAdminAcademyLessonBody }) =>
      createAcademyLesson(courseId, body),
    retry: 0,
    onSuccess: async (lesson) => {
      await invalidate();
      showSuccessToast(
        lesson.status === 'PUBLISHED'
          ? `Added and published "${lesson.title}".`
          : `Added "${lesson.title}" as a draft.`,
      );
    },
  });

  const updateLesson = useMutation({
    mutationFn: ({ lessonId, body }: { lessonId: string; body: UpdateAdminAcademyLessonBody }) =>
      updateAcademyLesson(lessonId, body),
    retry: 0,
    onSuccess: async (lesson) => {
      await invalidate();
      showSuccessToast(`Saved "${lesson.title}".`);
    },
  });

  const transitionLesson = useMutation({
    mutationFn: ({
      lessonId,
      transition,
    }: {
      lessonId: string;
      transition: AdminAcademyTransition;
    }) => transitionAcademyLesson(lessonId, transition),
    retry: 0,
    onSuccess: async (lesson, variables) => {
      await invalidate();
      showSuccessToast(`"${lesson.title}" ${TRANSITION_DONE[variables.transition]}`);
    },
    onError: reportTransitionError,
  });

  return {
    createCourse,
    updateCourse,
    transitionCourse,
    createLesson,
    updateLesson,
    transitionLesson,
  };
}
