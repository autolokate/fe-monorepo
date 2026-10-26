import type { AdminAcademyLessonDto, UpdateAdminAcademyLessonBody } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlModal } from '@autolokate/ui';
import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';

import { DiscoveryTextArea } from '@/features/discovery/DiscoveryTextArea';
import { useAcademyMutations } from '@/hooks/discovery/useAcademy';
import { describeAcademySubmitError } from '@/services/discovery/admin-academy-service';

const MAX_TAKEAWAYS = 8;

export type AcademyLessonSheetProps = {
  courseId: string;
  courseTitle: string;
  /** `null` = add a new lesson; otherwise edit that one. */
  lesson: AdminAcademyLessonDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
};

type FormValues = {
  youtube: string;
  title: string;
  description: string;
  takeaways: string;
  durationMinutes: string;
  sortOrder: string;
  publish: boolean;
};

const EMPTY_FORM: FormValues = {
  youtube: '',
  title: '',
  description: '',
  takeaways: '',
  durationMinutes: '',
  sortOrder: '0',
  publish: false,
};

function toFormValues(lesson: AdminAcademyLessonDto): FormValues {
  return {
    youtube: `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`,
    title: lesson.title,
    description: lesson.description,
    takeaways: lesson.takeaways.join('\n'),
    durationMinutes: lesson.durationMinutes === null ? '' : String(lesson.durationMinutes),
    sortOrder: String(lesson.sortOrder),
    publish: lesson.status === 'PUBLISHED',
  };
}

/** Returns `undefined` for blank, `NaN` for anything that is not an integer within range. */
function parseInteger(value: string, min: number, max: number): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : Number.NaN;
}

function parseTakeaways(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function validate(values: FormValues, isEdit: boolean): Partial<Record<keyof FormValues, string>> {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (!isEdit && values.youtube.trim().length < 11) {
    errors.youtube = 'Paste a YouTube link or the 11-character video id.';
  }
  if (isEdit && !values.title.trim()) {
    errors.title = 'Title is required.';
  }
  const takeaways = parseTakeaways(values.takeaways);
  if (takeaways.length > MAX_TAKEAWAYS || takeaways.some((t) => t.length > 200)) {
    errors.takeaways = `Up to ${String(MAX_TAKEAWAYS)} lines, 200 characters each.`;
  }
  if (Number.isNaN(parseInteger(values.durationMinutes, 1, 600))) {
    errors.durationMinutes = 'Whole minutes between 1 and 600.';
  }
  if (Number.isNaN(parseInteger(values.sortOrder, 0, 10000))) {
    errors.sortOrder = 'Whole number between 0 and 10000.';
  }
  return errors;
}

function toUpdateBody(
  lesson: AdminAcademyLessonDto,
  values: FormValues,
): UpdateAdminAcademyLessonBody {
  const body: UpdateAdminAcademyLessonBody = {};
  if (values.title.trim() !== lesson.title) body.title = values.title.trim();
  if (values.description.trim() !== lesson.description) {
    body.description = values.description.trim();
  }
  const takeaways = parseTakeaways(values.takeaways);
  if (takeaways.join('\n') !== lesson.takeaways.join('\n')) body.takeaways = takeaways;
  const duration = parseInteger(values.durationMinutes, 1, 600) ?? null;
  if (duration !== lesson.durationMinutes) body.durationMinutes = duration;
  const sortOrder = parseInteger(values.sortOrder, 0, 10000) ?? 0;
  if (sortOrder !== lesson.sortOrder) body.sortOrder = sortOrder;
  return body;
}

export function AcademyLessonSheet({
  courseId,
  courseTitle,
  lesson,
  open,
  onOpenChange,
  canWrite,
}: AcademyLessonSheetProps) {
  const isEdit = lesson !== null;
  const { createLesson, updateLesson } = useAcademyMutations();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(lesson ? toFormValues(lesson) : EMPTY_FORM);
      setSubmitted(false);
      setSubmitError(null);
    }
  }, [open, lesson]);

  const errors = validate(values, isEdit);
  const shownErrors = submitted ? errors : {};
  const updateBody = lesson ? toUpdateBody(lesson, values) : null;
  const hasChanges = updateBody ? Object.keys(updateBody).length > 0 : true;
  const isBusy = createLesson.isPending || updateLesson.isPending;
  const readOnly = !canWrite || isBusy;

  const set =
    <K extends keyof FormValues>(key: K) =>
    (value: FormValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
    };

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError(null);
    if (Object.keys(errors).length > 0) {
      return;
    }
    const onError = (error: unknown) => {
      setSubmitError(describeAcademySubmitError(error));
    };
    const onSuccess = () => {
      onOpenChange(false);
    };
    if (lesson && updateBody) {
      updateLesson.mutate({ lessonId: lesson.lessonId, body: updateBody }, { onSuccess, onError });
      return;
    }
    const duration = parseInteger(values.durationMinutes, 1, 600);
    const sortOrder = parseInteger(values.sortOrder, 0, 10000);
    const takeaways = parseTakeaways(values.takeaways);
    createLesson.mutate(
      {
        courseId,
        body: {
          youtube: values.youtube.trim(),
          ...(values.title.trim() ? { title: values.title.trim() } : {}),
          ...(values.description.trim() ? { description: values.description.trim() } : {}),
          ...(takeaways.length > 0 ? { takeaways } : {}),
          ...(duration !== undefined ? { durationMinutes: duration } : {}),
          ...(sortOrder !== undefined ? { sortOrder } : {}),
          publish: values.publish,
        },
      },
      { onSuccess, onError },
    );
  };

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={!isEdit ? 'Add lesson' : canWrite ? 'Edit lesson' : 'Lesson'}
      description={
        isEdit
          ? `In "${courseTitle}". The YouTube video is fixed after it is added.`
          : `To "${courseTitle}". The server checks the video belongs to the Indian Drive Guide channel before saving.`
      }
      footer={
        <div className="admin-modal-actions">
          {canWrite ? (
            <AlButton
              type="submit"
              form="academy-lesson-form"
              size="sm"
              data-testid="academy-lesson-submit"
              loading={isBusy}
              disabled={isBusy || (isEdit && !hasChanges)}
            >
              {isEdit ? 'Save changes' : values.publish ? 'Add and publish' : 'Add as draft'}
            </AlButton>
          ) : null}
          <AlButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {canWrite ? 'Cancel' : 'Close'}
          </AlButton>
        </div>
      }
    >
      <form id="academy-lesson-form" className="admin-form-stack" noValidate onSubmit={onSubmit}>
        <AlInput
          label="YouTube link"
          mono
          value={values.youtube}
          data-testid="academy-lesson-youtube"
          placeholder="https://www.youtube.com/watch?v=…"
          helperText={
            isEdit
              ? 'Fixed after creation.'
              : 'watch, youtu.be, shorts or embed link, or the bare id.'
          }
          errorText={shownErrors.youtube}
          disabled={isEdit || readOnly}
          autoComplete="off"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('youtube')(event.target.value);
          }}
        />
        <AlInput
          label="Title"
          value={values.title}
          data-testid="academy-lesson-title"
          helperText={isEdit ? undefined : 'Leave blank to use the YouTube title.'}
          errorText={shownErrors.title}
          maxLength={200}
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('title')(event.target.value);
          }}
        />
        <DiscoveryTextArea
          label="Description"
          value={values.description}
          rows={3}
          maxLength={4000}
          disabled={readOnly}
          onChange={(event) => {
            set('description')(event.target.value);
          }}
        />
        <DiscoveryTextArea
          label="Key takeaways"
          value={values.takeaways}
          rows={4}
          data-testid="academy-lesson-takeaways"
          helperText={`One per line, up to ${String(MAX_TAKEAWAYS)}. Shown under the video.`}
          errorText={shownErrors.takeaways}
          disabled={readOnly}
          onChange={(event) => {
            set('takeaways')(event.target.value);
          }}
        />
        <AlInput
          label="Duration (minutes)"
          inputMode="numeric"
          value={values.durationMinutes}
          data-testid="academy-lesson-duration"
          helperText="Optional. Leave blank if you have not checked the video length."
          errorText={shownErrors.durationMinutes}
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('durationMinutes')(event.target.value);
          }}
        />
        <AlInput
          label="Position"
          inputMode="numeric"
          value={values.sortOrder}
          data-testid="academy-lesson-sort-order"
          helperText="Lessons play in ascending order."
          errorText={shownErrors.sortOrder}
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('sortOrder')(event.target.value);
          }}
        />
        {!isEdit ? (
          <AlCheckbox
            label="Publish immediately"
            checked={values.publish}
            data-testid="academy-lesson-publish"
            disabled={readOnly}
            onChange={(event) => {
              set('publish')(event.target.checked);
            }}
          />
        ) : null}
        {submitError ? (
          <p className="admin-form-error" data-testid="academy-lesson-submit-error">
            {submitError}
          </p>
        ) : null}
      </form>
    </AlModal>
  );
}
