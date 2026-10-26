import {
  ACADEMY_LANGUAGES,
  ACADEMY_LEVELS,
  type AcademyLanguage,
  type AcademyLevel,
  type AdminAcademyCourseDto,
  type UpdateAdminAcademyCourseBody,
} from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlModal, AlSelect } from '@autolokate/ui';
import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';

import { DiscoveryTextArea } from '@/features/discovery/DiscoveryTextArea';
import { useAcademyMutations } from '@/hooks/discovery/useAcademy';
import { describeAcademySubmitError } from '@/services/discovery/admin-academy-service';

export const ACADEMY_LEVEL_LABEL: Record<AcademyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const ACADEMY_LANGUAGE_LABEL: Record<AcademyLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
};

const LEVEL_OPTIONS = ACADEMY_LEVELS.map((value) => ({ value, label: ACADEMY_LEVEL_LABEL[value] }));
const LANGUAGE_OPTIONS = ACADEMY_LANGUAGES.map((value) => ({
  value,
  label: ACADEMY_LANGUAGE_LABEL[value],
}));

export type AcademyCourseSheetProps = {
  /** `null` = create a new course; otherwise edit that one. */
  course: AdminAcademyCourseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (courseId: string) => void;
  canWrite: boolean;
};

type FormValues = {
  title: string;
  tagline: string;
  description: string;
  level: AcademyLevel;
  language: AcademyLanguage;
  featured: boolean;
  sortOrder: string;
};

const EMPTY_FORM: FormValues = {
  title: '',
  tagline: '',
  description: '',
  level: 'beginner',
  language: 'en',
  featured: false,
  sortOrder: '0',
};

function toFormValues(course: AdminAcademyCourseDto): FormValues {
  return {
    title: course.title,
    tagline: course.tagline,
    description: course.description,
    level: course.level,
    language: course.language,
    featured: course.featured,
    sortOrder: String(course.sortOrder),
  };
}

function parseSortOrder(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 10000 ? parsed : Number.NaN;
}

function validate(values: FormValues): Partial<Record<keyof FormValues, string>> {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  }
  if (Number.isNaN(parseSortOrder(values.sortOrder))) {
    errors.sortOrder = 'Whole number between 0 and 10000.';
  }
  return errors;
}

function toUpdateBody(
  course: AdminAcademyCourseDto,
  values: FormValues,
): UpdateAdminAcademyCourseBody {
  const body: UpdateAdminAcademyCourseBody = {};
  if (values.title.trim() !== course.title) body.title = values.title.trim();
  if (values.tagline.trim() !== course.tagline) body.tagline = values.tagline.trim();
  if (values.description.trim() !== course.description) {
    body.description = values.description.trim();
  }
  if (values.level !== course.level) body.level = values.level;
  if (values.language !== course.language) body.language = values.language;
  if (values.featured !== course.featured) body.featured = values.featured;
  const sortOrder = parseSortOrder(values.sortOrder);
  if (sortOrder !== course.sortOrder) body.sortOrder = sortOrder;
  return body;
}

export function AcademyCourseSheet({
  course,
  open,
  onOpenChange,
  onCreated,
  canWrite,
}: AcademyCourseSheetProps) {
  const isEdit = course !== null;
  const { createCourse, updateCourse } = useAcademyMutations();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(course ? toFormValues(course) : EMPTY_FORM);
      setSubmitted(false);
      setSubmitError(null);
    }
  }, [open, course]);

  const errors = validate(values);
  const shownErrors = submitted ? errors : {};
  const updateBody = course ? toUpdateBody(course, values) : null;
  const hasChanges = updateBody ? Object.keys(updateBody).length > 0 : true;
  const isBusy = createCourse.isPending || updateCourse.isPending;
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
    if (course && updateBody) {
      updateCourse.mutate(
        { courseId: course.courseId, body: updateBody },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
          onError,
        },
      );
      return;
    }
    createCourse.mutate(
      {
        title: values.title.trim(),
        ...(values.tagline.trim() ? { tagline: values.tagline.trim() } : {}),
        ...(values.description.trim() ? { description: values.description.trim() } : {}),
        level: values.level,
        language: values.language,
        featured: values.featured,
        sortOrder: parseSortOrder(values.sortOrder),
      },
      {
        onSuccess: (created) => {
          onOpenChange(false);
          onCreated?.(created.courseId);
        },
        onError,
      },
    );
  };

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={!isEdit ? 'New Academy course' : canWrite ? 'Edit course' : 'Course'}
      description={
        isEdit
          ? 'Edits to a published course are live immediately.'
          : 'Courses start as drafts. Add at least one published lesson before publishing the course.'
      }
      footer={
        <div className="admin-modal-actions">
          {canWrite ? (
            <AlButton
              type="submit"
              form="academy-course-form"
              size="sm"
              data-testid="academy-course-submit"
              loading={isBusy}
              disabled={isBusy || (isEdit && !hasChanges)}
            >
              {isEdit ? 'Save changes' : 'Create draft course'}
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
      <form id="academy-course-form" className="admin-form-stack" noValidate onSubmit={onSubmit}>
        <AlInput
          label="Title"
          value={values.title}
          data-testid="academy-course-title"
          errorText={shownErrors.title}
          maxLength={200}
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('title')(event.target.value);
          }}
        />
        <AlInput
          label="Tagline"
          value={values.tagline}
          data-testid="academy-course-tagline"
          helperText="One line shown under the title."
          maxLength={200}
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('tagline')(event.target.value);
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
        <AlSelect
          label="Level"
          options={LEVEL_OPTIONS}
          value={values.level}
          data-testid="academy-course-level"
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            set('level')(event.target.value as AcademyLevel);
          }}
        />
        <AlSelect
          label="Language"
          options={LANGUAGE_OPTIONS}
          value={values.language}
          data-testid="academy-course-language"
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            set('language')(event.target.value as AcademyLanguage);
          }}
        />
        <AlInput
          label="Sort order"
          inputMode="numeric"
          value={values.sortOrder}
          data-testid="academy-course-sort-order"
          helperText="Lower numbers appear first in the consumer Academy."
          errorText={shownErrors.sortOrder}
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('sortOrder')(event.target.value);
          }}
        />
        <AlCheckbox
          label="Featured"
          checked={values.featured}
          disabled={readOnly}
          onChange={(event) => {
            set('featured')(event.target.checked);
          }}
        />
        {submitError ? (
          <p className="admin-form-error" data-testid="academy-course-submit-error">
            {submitError}
          </p>
        ) : null}
      </form>
    </AlModal>
  );
}
