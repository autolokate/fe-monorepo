import {
  DAILY_DRIVE_CATEGORIES,
  type AdminDailyDriveVideoDto,
  type DailyDriveCategory,
  type UpdateAdminDailyDriveVideoBody,
} from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlModal, AlSelect } from '@autolokate/ui';
import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';

import { DiscoveryTextArea } from '@/features/discovery/DiscoveryTextArea';
import { useDailyDriveMutations } from '@/hooks/discovery/useDailyDrive';
import { describeDailyDriveSubmitError } from '@/services/discovery/admin-daily-drive-service';

export type DailyDriveSheetProps = {
  /** `null` = add a new video; otherwise edit that one. */
  video: AdminDailyDriveVideoDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
};

type FormValues = {
  youtube: string;
  category: DailyDriveCategory;
  title: string;
  description: string;
  durationMinutes: string;
  featured: boolean;
  sortOrder: string;
  publish: boolean;
};

const EMPTY_FORM: FormValues = {
  youtube: '',
  category: 'driving',
  title: '',
  description: '',
  durationMinutes: '',
  featured: false,
  sortOrder: '0',
  publish: false,
};

export const DAILY_DRIVE_CATEGORY_LABEL: Record<DailyDriveCategory, string> = {
  driving: 'Driving skills',
  safety: 'Safety',
  rules: 'Road rules',
  cars: 'Cars',
  highway: 'Highway',
  tips: 'Tips',
  ev: 'EV',
  care: 'Car care',
};

const CATEGORY_OPTIONS = DAILY_DRIVE_CATEGORIES.map((value) => ({
  value,
  label: DAILY_DRIVE_CATEGORY_LABEL[value],
}));

function toFormValues(video: AdminDailyDriveVideoDto): FormValues {
  return {
    youtube: video.watchUrl,
    category: video.category,
    title: video.title,
    description: video.description,
    durationMinutes: video.durationMinutes === null ? '' : String(video.durationMinutes),
    featured: video.featured,
    sortOrder: String(video.sortOrder),
    publish: video.status === 'PUBLISHED',
  };
}

/** Returns `undefined` for blank, `NaN` for anything that is not an integer within range. */
function parseInteger(value: string, min: number, max: number): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : Number.NaN;
}

function validate(values: FormValues, isEdit: boolean): Partial<Record<keyof FormValues, string>> {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (!isEdit && values.youtube.trim().length < 11) {
    errors.youtube = 'Paste a YouTube link or the 11-character video id.';
  }
  if (isEdit && !values.title.trim()) {
    errors.title = 'Title is required.';
  }
  if (Number.isNaN(parseInteger(values.durationMinutes, 1, 600))) {
    errors.durationMinutes = 'Whole minutes between 1 and 600.';
  }
  if (Number.isNaN(parseInteger(values.sortOrder, 0, 100000))) {
    errors.sortOrder = 'Whole number between 0 and 100000.';
  }
  return errors;
}

function toUpdateBody(
  video: AdminDailyDriveVideoDto,
  values: FormValues,
): UpdateAdminDailyDriveVideoBody {
  const body: UpdateAdminDailyDriveVideoBody = {};
  const title = values.title.trim();
  if (title !== video.title) body.title = title;
  if (values.description.trim() !== video.description) body.description = values.description.trim();
  if (values.category !== video.category) body.category = values.category;
  const duration = parseInteger(values.durationMinutes, 1, 600) ?? null;
  if (duration !== video.durationMinutes) body.durationMinutes = duration;
  if (values.featured !== video.featured) body.featured = values.featured;
  const sortOrder = parseInteger(values.sortOrder, 0, 100000) ?? 0;
  if (sortOrder !== video.sortOrder) body.sortOrder = sortOrder;
  return body;
}

export function DailyDriveSheet({ video, open, onOpenChange, canWrite }: DailyDriveSheetProps) {
  const isEdit = video !== null;
  const { createMutation, updateMutation } = useDailyDriveMutations();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(video ? toFormValues(video) : EMPTY_FORM);
      setSubmitted(false);
      setSubmitError(null);
    }
  }, [open, video]);

  const errors = validate(values, isEdit);
  const shownErrors = submitted ? errors : {};
  const updateBody = video ? toUpdateBody(video, values) : null;
  const hasChanges = updateBody ? Object.keys(updateBody).length > 0 : true;
  const isBusy = createMutation.isPending || updateMutation.isPending;
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
      setSubmitError(describeDailyDriveSubmitError(error));
    };
    const onSuccess = () => {
      onOpenChange(false);
    };
    if (video && updateBody) {
      updateMutation.mutate({ videoId: video.videoId, body: updateBody }, { onSuccess, onError });
      return;
    }
    const duration = parseInteger(values.durationMinutes, 1, 600);
    const sortOrder = parseInteger(values.sortOrder, 0, 100000);
    createMutation.mutate(
      {
        youtube: values.youtube.trim(),
        category: values.category,
        ...(values.title.trim() ? { title: values.title.trim() } : {}),
        ...(values.description.trim() ? { description: values.description.trim() } : {}),
        ...(duration !== undefined ? { durationMinutes: duration } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        featured: values.featured,
        publish: values.publish,
      },
      { onSuccess, onError },
    );
  };

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={
        !isEdit
          ? 'Add Daily Drive video'
          : canWrite
            ? 'Edit Daily Drive video'
            : 'Daily Drive video'
      }
      description={
        isEdit
          ? 'The YouTube video is fixed after it is added. Edits to a published video are live immediately.'
          : 'The server checks the video belongs to the Indian Drive Guide channel before saving.'
      }
      footer={
        <div className="admin-modal-actions">
          {canWrite ? (
            <AlButton
              type="submit"
              form="daily-drive-form"
              size="sm"
              data-testid="daily-drive-submit"
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
      <form id="daily-drive-form" className="admin-form-stack" noValidate onSubmit={onSubmit}>
        <AlInput
          label="YouTube link"
          mono
          value={values.youtube}
          data-testid="daily-drive-youtube"
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
        <AlSelect
          label="Category"
          options={CATEGORY_OPTIONS}
          value={values.category}
          data-testid="daily-drive-category"
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            set('category')(event.target.value as DailyDriveCategory);
          }}
        />
        <AlInput
          label="Title"
          value={values.title}
          data-testid="daily-drive-title"
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
          maxLength={2000}
          disabled={readOnly}
          onChange={(event) => {
            set('description')(event.target.value);
          }}
        />
        <AlInput
          label="Duration (minutes)"
          inputMode="numeric"
          value={values.durationMinutes}
          data-testid="daily-drive-duration"
          helperText="Optional."
          errorText={shownErrors.durationMinutes}
          disabled={readOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            set('durationMinutes')(event.target.value);
          }}
        />
        <AlInput
          label="Sort order"
          inputMode="numeric"
          value={values.sortOrder}
          data-testid="daily-drive-sort-order"
          helperText="Lower numbers appear first in the consumer library."
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
        {!isEdit ? (
          <AlCheckbox
            label="Publish immediately"
            checked={values.publish}
            data-testid="daily-drive-publish"
            disabled={readOnly}
            onChange={(event) => {
              set('publish')(event.target.checked);
            }}
          />
        ) : null}
        {submitError ? (
          <p className="admin-form-error" data-testid="daily-drive-submit-error">
            {submitError}
          </p>
        ) : null}
      </form>
    </AlModal>
  );
}
