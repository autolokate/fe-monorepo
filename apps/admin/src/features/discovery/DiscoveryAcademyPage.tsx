import type {
  AdminAcademyCourseDto,
  AdminAcademyLessonDto,
  AdminAcademyStatus,
  AdminAcademyTransition,
} from '@autolokate/api-client';
import {
  AlButton,
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
  type ColumnDef,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import {
  ACADEMY_LANGUAGE_LABEL,
  ACADEMY_LEVEL_LABEL,
  AcademyCourseSheet,
} from '@/features/discovery/AcademyCourseSheet';
import { AcademyLessonSheet } from '@/features/discovery/AcademyLessonSheet';
import { formatDiscoveryDateTime, type FilterOption } from '@/features/discovery/discovery-filters';
import {
  useAcademyCourse,
  useAcademyCourses,
  useAcademyMutations,
  type AcademyStatusFilter,
} from '@/hooks/discovery/useAcademy';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { DiscoveryReelStatusBadge } from '@/platform/components/EntityStatusBadge';
import { useCanWriteDiscoveryMutations } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './discovery.css';

const STATUS_FILTERS: FilterOption<AcademyStatusFilter>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const TRANSITION_LABEL: Record<AdminAcademyTransition, string> = {
  publish: 'Publish',
  unpublish: 'Unpublish',
  archive: 'Archive',
};

function nextTransitions(status: AdminAcademyStatus): AdminAcademyTransition[] {
  if (status === 'PUBLISHED') return ['unpublish', 'archive'];
  if (status === 'DRAFT') return ['publish', 'archive'];
  return ['publish'];
}

type ConfirmTarget =
  | { kind: 'course'; id: string; title: string; transition: 'unpublish' | 'archive' }
  | { kind: 'lesson'; id: string; title: string; transition: 'unpublish' | 'archive' };

function confirmCopy(target: ConfirmTarget) {
  const noun = target.kind === 'course' ? 'course' : 'lesson';
  if (target.transition === 'unpublish') {
    return {
      title: `Unpublish ${noun}?`,
      description: `"${target.title}" will leave the consumer Academy and return to draft. You can publish it again later.`,
      verb: 'Unpublish',
      destructive: false,
    };
  }
  return {
    title: `Archive ${noun}?`,
    description: `"${target.title}" will be removed from the consumer Academy and archived.`,
    verb: 'Archive',
    destructive: true,
  };
}

export function DiscoveryAcademyPage() {
  const { courses, isLoading, isFetching, userErrorMessage, status, setStatus, refresh, data } =
    useAcademyCourses();
  const canWrite = useCanWriteDiscoveryMutations();
  const { transitionCourse, transitionLesson } = useAcademyMutations();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useAcademyCourse(selectedId);
  const selected = detail.data ?? null;

  const [courseSheet, setCourseSheet] = useState<{
    open: boolean;
    course: AdminAcademyCourseDto | null;
  }>({ open: false, course: null });
  const [lessonSheet, setLessonSheet] = useState<{
    open: boolean;
    lesson: AdminAcademyLessonDto | null;
  }>({ open: false, lesson: null });
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const runCourse = useCallback(
    (courseId: string, transition: AdminAcademyTransition) => {
      setPendingId(courseId);
      transitionCourse.mutate(
        { courseId, transition },
        {
          onSettled: () => {
            setPendingId(null);
            setConfirmTarget(null);
          },
        },
      );
    },
    [transitionCourse],
  );

  const runLesson = useCallback(
    (lessonId: string, transition: AdminAcademyTransition) => {
      setPendingId(lessonId);
      transitionLesson.mutate(
        { lessonId, transition },
        {
          onSettled: () => {
            setPendingId(null);
            setConfirmTarget(null);
          },
        },
      );
    },
    [transitionLesson],
  );

  const requestCourse = useCallback(
    (course: AdminAcademyCourseDto, transition: AdminAcademyTransition) => {
      if (transition === 'publish') {
        runCourse(course.courseId, transition);
        return;
      }
      setConfirmTarget({ kind: 'course', id: course.courseId, title: course.title, transition });
    },
    [runCourse],
  );

  const requestLesson = useCallback(
    (lesson: AdminAcademyLessonDto, transition: AdminAcademyTransition) => {
      if (transition === 'publish') {
        runLesson(lesson.lessonId, transition);
        return;
      }
      setConfirmTarget({ kind: 'lesson', id: lesson.lessonId, title: lesson.title, transition });
    },
    [runLesson],
  );

  const courseColumns = useMemo<ColumnDef<AdminAcademyCourseDto>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Course',
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">{row.original.title}</span>
            {row.original.tagline ? (
              <span className="discovery-cell-title__secondary">{row.original.tagline}</span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'level',
        header: 'Level',
        cell: ({ row }) => ACADEMY_LEVEL_LABEL[row.original.level],
      },
      {
        accessorKey: 'language',
        header: 'Language',
        cell: ({ row }) => ACADEMY_LANGUAGE_LABEL[row.original.language],
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DiscoveryReelStatusBadge status={row.original.status} />,
      },
      {
        id: 'lessons',
        header: 'Lessons',
        cell: ({ row }) =>
          `${row.original.publishedLessonCount.toLocaleString()} of ${row.original.lessonCount.toLocaleString()} published`,
      },
      { accessorKey: 'sortOrder', header: 'Order' },
      {
        accessorKey: 'publishedAt',
        header: 'Published',
        cell: ({ row }) => formatDiscoveryDateTime(row.original.publishedAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="discovery-row-actions">
              {canWrite
                ? nextTransitions(course.status).map((transition) => (
                    <AlButton
                      key={transition}
                      size="sm"
                      variant="secondary"
                      data-testid={`academy-course-${transition}-${course.courseId}`}
                      loading={
                        pendingId === course.courseId &&
                        transitionCourse.variables?.transition === transition
                      }
                      disabled={pendingId !== null}
                      onClick={(event) => {
                        event.stopPropagation();
                        requestCourse(course, transition);
                      }}
                    >
                      {TRANSITION_LABEL[transition]}
                    </AlButton>
                  ))
                : null}
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`academy-course-lessons-${course.courseId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(course.courseId);
                }}
              >
                Lessons
              </AlButton>
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`academy-course-edit-${course.courseId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setCourseSheet({ open: true, course });
                }}
              >
                {canWrite ? 'Edit' : 'View'}
              </AlButton>
            </div>
          );
        },
      },
    ],
    [canWrite, pendingId, requestCourse, transitionCourse.variables],
  );

  const lessonColumns = useMemo<ColumnDef<AdminAcademyLessonDto>[]>(
    () => [
      {
        id: 'thumb',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="discovery-thumb discovery-thumb--wide">
            <img src={row.original.thumbnailUrl} alt="" loading="lazy" />
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Lesson',
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">{row.original.title}</span>
            <a
              className="discovery-cell-title__secondary"
              href={`https://www.youtube.com/watch?v=${row.original.youtubeVideoId}`}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {row.original.youtubeVideoId}
            </a>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DiscoveryReelStatusBadge status={row.original.status} />,
      },
      {
        id: 'takeaways',
        header: 'Takeaways',
        cell: ({ row }) =>
          row.original.takeaways.length > 0 ? row.original.takeaways.length.toLocaleString() : '—',
      },
      {
        accessorKey: 'durationMinutes',
        header: 'Minutes',
        cell: ({ row }) => row.original.durationMinutes ?? '—',
      },
      { accessorKey: 'sortOrder', header: 'Position' },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const lesson = row.original;
          return (
            <div className="discovery-row-actions">
              {canWrite
                ? nextTransitions(lesson.status).map((transition) => (
                    <AlButton
                      key={transition}
                      size="sm"
                      variant="secondary"
                      data-testid={`academy-lesson-${transition}-${lesson.lessonId}`}
                      loading={
                        pendingId === lesson.lessonId &&
                        transitionLesson.variables?.transition === transition
                      }
                      disabled={pendingId !== null}
                      onClick={(event) => {
                        event.stopPropagation();
                        requestLesson(lesson, transition);
                      }}
                    >
                      {TRANSITION_LABEL[transition]}
                    </AlButton>
                  ))
                : null}
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`academy-lesson-edit-${lesson.lessonId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setLessonSheet({ open: true, lesson });
                }}
              >
                {canWrite ? 'Edit' : 'View'}
              </AlButton>
            </div>
          );
        },
      },
    ],
    [canWrite, pendingId, requestLesson, transitionLesson.variables],
  );

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Courses of Indian Drive Guide lessons for members with an active plan.';
    }
    const published = courses.filter((course) => course.status === 'PUBLISHED').length;
    return buildPageSummary([
      `${courses.length.toLocaleString()} courses`,
      `${published.toLocaleString()} published`,
      'Lessons need an active plan to play',
    ]);
  }, [isLoading, courses]);

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="discovery:read">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  const copy = confirmTarget ? confirmCopy(confirmTarget) : null;

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Academy"
          description={pageDescription}
          actions={
            <>
              {canWrite ? (
                <AlPageHeaderAction
                  label="New course"
                  onClick={() => {
                    setCourseSheet({ open: true, course: null });
                  }}
                />
              ) : null}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
            </>
          }
        />

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={STATUS_FILTERS}
                value={status}
                onChange={setStatus}
                aria-label="Academy course status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="discovery-academy-courses"
            columns={courseColumns}
            data={courses}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            enableGlobalSearch={false}
            emptyTitle="No Academy courses"
            emptyDescription={
              canWrite
                ? 'Create a course, add Indian Drive Guide lessons, then publish it.'
                : 'Change the filter to see more courses.'
            }
            getRowId={(row) => row.courseId}
            onRowClick={(course) => {
              setSelectedId(course.courseId);
            }}
          />
        </AdminDataBlock>

        {selectedId ? (
          <AlStack gap="sm">
            <AlStack direction="row" gap="sm" align="center" justify="between">
              <AlStack gap="xs">
                <AlText variant="label" data-testid="academy-lessons-heading">
                  {selected ? `Lessons in "${selected.title}"` : 'Lessons'}
                </AlText>
                <AlText tone="muted" variant="caption">
                  Members see published lessons in position order. Draft and archived lessons stay
                  hidden.
                </AlText>
              </AlStack>
              {canWrite && selected ? (
                <AlButton
                  size="sm"
                  data-testid="academy-lesson-add"
                  onClick={() => {
                    setLessonSheet({ open: true, lesson: null });
                  }}
                >
                  Add lesson
                </AlButton>
              ) : null}
            </AlStack>
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="discovery-academy-lessons"
              columns={lessonColumns}
              data={selected?.lessons ?? []}
              loading={detail.isLoading}
              isRefreshing={detail.isFetching}
              error={detail.userErrorMessage}
              onRetry={detail.refresh}
              enableGlobalSearch={false}
              emptyTitle="No lessons yet"
              emptyDescription={
                canWrite
                  ? 'Add a lesson from the Indian Drive Guide channel.'
                  : 'This course has no lessons.'
              }
              getRowId={(row) => row.lessonId}
              onRowClick={(lesson) => {
                setLessonSheet({ open: true, lesson });
              }}
            />
          </AlStack>
        ) : null}

        <AcademyCourseSheet
          course={courseSheet.course}
          open={courseSheet.open}
          onOpenChange={(open) => {
            setCourseSheet((current) => ({ ...current, open }));
          }}
          onCreated={setSelectedId}
          canWrite={canWrite}
        />

        {selected ? (
          <AcademyLessonSheet
            courseId={selected.courseId}
            courseTitle={selected.title}
            lesson={lessonSheet.lesson}
            open={lessonSheet.open}
            onOpenChange={(open) => {
              setLessonSheet((current) => ({ ...current, open }));
            }}
            canWrite={canWrite}
          />
        ) : null}

        <AlConfirmationDialog
          open={confirmTarget !== null}
          onOpenChange={(open) => {
            if (!open && pendingId === null) {
              setConfirmTarget(null);
            }
          }}
          title={copy?.title ?? ''}
          description={copy?.description ?? ''}
          confirmLabel={copy?.verb ?? 'Confirm'}
          destructive={copy?.destructive ?? false}
          loading={pendingId !== null}
          onConfirm={() => {
            if (!confirmTarget) return;
            if (confirmTarget.kind === 'course') {
              runCourse(confirmTarget.id, confirmTarget.transition);
            } else {
              runLesson(confirmTarget.id, confirmTarget.transition);
            }
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
