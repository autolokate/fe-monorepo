import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminDiscoveryReelDto, AdminReelTransition } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlModal, AlText } from '@autolokate/ui';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { DiscoveryTextArea } from '@/features/discovery/DiscoveryTextArea';
import { formatCount, formatDiscoveryDateTime } from '@/features/discovery/discovery-filters';
import {
  EMPTY_REEL_FORM,
  REEL_MAX_BYTES,
  REEL_POSTER_TYPES,
  REEL_VIDEO_TYPES,
  reelFormSchema,
  reelToFormValues,
  toCreateReelBody,
  toUpdateReelBody,
  validateReelFile,
  type ReelFormValues,
} from '@/features/discovery/reel-schemas';
import { useDiscoveryMutations } from '@/hooks/discovery/useDiscoveryMutations';
import { useDiscoveryReelDetail } from '@/hooks/discovery/useDiscoveryReels';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { shortAdminId } from '@/platform/components/AdminWowSurface';
import { DiscoveryReelStatusBadge } from '@/platform/components/EntityStatusBadge';
import { uploadDiscoveryReelMedia } from '@/services/discovery/admin-discovery-service';
import { describeDiscoverySubmitError } from '@/services/discovery/discovery-errors';

export type ReelSheetProps = {
  /** `null` = create a new reel; otherwise edit that one. */
  reel: AdminDiscoveryReelDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
  /** Publish / unpublish / archive are confirmed + executed by the page; the sheet closes first. */
  onRequestTransition: (reel: AdminDiscoveryReelDto, transition: AdminReelTransition) => void;
};

type UploadedMedia = { file: File; mediaId: string };

type Stage = 'idle' | 'video' | 'poster' | 'saving';

const STAGE_LABEL: Record<Stage, string> = {
  idle: '',
  video: 'Uploading video…',
  poster: 'Uploading poster…',
  saving: 'Saving reel…',
};

function FileField({
  label,
  helperText,
  accept,
  file,
  errorText,
  disabled,
  testId,
  onChange,
}: {
  label: string;
  helperText: string;
  accept: string;
  file: File | null;
  errorText: string | null;
  disabled: boolean;
  testId: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="admin-field">
      {label}
      <input
        type="file"
        className="discovery-file-input"
        accept={accept}
        disabled={disabled}
        data-testid={testId}
        aria-label={label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.files?.[0] ?? null);
        }}
      />
      {errorText ? (
        <span className="admin-form-error" role="alert">
          {errorText}
        </span>
      ) : file ? (
        <span className="admin-field__hint">
          {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
        </span>
      ) : (
        <span className="admin-field__hint">{helperText}</span>
      )}
    </label>
  );
}

export function ReelSheet({
  reel,
  open,
  onOpenChange,
  canWrite,
  onRequestTransition,
}: ReelSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const uploadedVideoRef = useRef<UploadedMedia | null>(null);
  const uploadedPosterRef = useRef<UploadedMedia | null>(null);
  const { createReelMutation, updateReelMutation } = useDiscoveryMutations();
  const isEdit = reel !== null;

  const detail = useDiscoveryReelDetail(reel?.reelId ?? null, open && isEdit);
  const liveReel = detail.data ?? reel;

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [removePoster, setRemovePoster] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [flowError, setFlowError] = useState<string | null>(null);

  const form = useForm<ReelFormValues>({
    resolver: zodResolver(reelFormSchema),
    defaultValues: EMPTY_REEL_FORM,
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }
    form.reset(reel ? reelToFormValues(reel) : EMPTY_REEL_FORM);
    setVideoFile(null);
    setPosterFile(null);
    setRemovePoster(false);
    setVideoError(null);
    setPosterError(null);
    setStage('idle');
    setFlowError(null);
    uploadedVideoRef.current = null;
    uploadedPosterRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the sheet opens / target changes
  }, [form, open, reel?.reelId]);

  const isBusy = stage !== 'idle';

  const pickVideo = (file: File | null) => {
    setVideoFile(file);
    setVideoError(file ? validateReelFile(file, REEL_VIDEO_TYPES, 'video') : null);
  };

  const pickPoster = (file: File | null) => {
    setPosterFile(file);
    setPosterError(file ? validateReelFile(file, REEL_POSTER_TYPES, 'poster') : null);
    if (file) {
      setRemovePoster(false);
    }
  };

  /** Reuses an already-confirmed upload of the same file, so a failed save can be retried without re-uploading. */
  const ensureUploaded = async (
    file: File,
    cache: { current: UploadedMedia | null },
    which: 'video' | 'poster',
    signal: AbortSignal,
  ): Promise<string> => {
    if (cache.current?.file === file) {
      return cache.current.mediaId;
    }
    setStage(which);
    const completed = await uploadDiscoveryReelMedia(file, { signal });
    cache.current = { file, mediaId: completed.mediaId };
    return completed.mediaId;
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (isBusy) {
      return;
    }
    const nextVideoError = videoFile
      ? validateReelFile(videoFile, REEL_VIDEO_TYPES, 'video')
      : !isEdit
        ? 'Choose the reel video (MP4).'
        : null;
    const nextPosterError = posterFile
      ? validateReelFile(posterFile, REEL_POSTER_TYPES, 'poster')
      : null;
    setVideoError(nextVideoError);
    setPosterError(nextPosterError);
    if (nextVideoError || nextPosterError) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setFlowError(null);

    try {
      const videoMediaId = videoFile
        ? await ensureUploaded(videoFile, uploadedVideoRef, 'video', controller.signal)
        : undefined;
      const thumbMediaId = posterFile
        ? await ensureUploaded(posterFile, uploadedPosterRef, 'poster', controller.signal)
        : undefined;

      setStage('saving');
      if (reel) {
        const body = toUpdateReelBody(values, reel, {
          ...(videoMediaId ? { videoMediaId } : {}),
          ...(thumbMediaId ? { thumbMediaId } : {}),
          removePoster,
        });
        if (Object.keys(body).length === 0) {
          setStage('idle');
          return;
        }
        await updateReelMutation.mutateAsync({
          reelId: reel.reelId,
          body,
          signal: controller.signal,
        });
      } else if (videoMediaId) {
        await createReelMutation.mutateAsync({
          body: toCreateReelBody(values, {
            videoMediaId,
            ...(thumbMediaId ? { thumbMediaId } : {}),
          }),
          signal: controller.signal,
        });
      }
      setStage('idle');
      onOpenChange(false);
    } catch (error) {
      setStage('idle');
      setFlowError(describeDiscoverySubmitError(error));
    }
  });

  const watched = form.watch();
  const hasChanges = useMemo(() => {
    if (!reel) {
      return true;
    }
    return (
      Object.keys(
        toUpdateReelBody(watched, reel, {
          ...(videoFile ? { videoMediaId: 'pending' } : {}),
          ...(posterFile ? { thumbMediaId: 'pending' } : {}),
          removePoster,
        }),
      ).length > 0
    );
  }, [posterFile, reel, removePoster, videoFile, watched]);

  const title = !isEdit ? 'New reel' : canWrite ? 'Edit reel' : 'Reel detail';

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={title}
      description={
        isEdit
          ? 'Edits to a published reel are live in the consumer feed as soon as you save.'
          : 'Upload an MP4 (and optional poster), then save as a draft or publish immediately.'
      }
      footer={
        <div className="admin-modal-actions">
          {canWrite ? (
            <>
              <AlButton
                type="submit"
                form="discovery-reel-form"
                size="sm"
                data-testid="discovery-reel-submit"
                loading={isBusy}
                disabled={isBusy || (isEdit && !hasChanges)}
              >
                {isBusy
                  ? STAGE_LABEL[stage]
                  : isEdit
                    ? 'Save changes'
                    : watched.publishNow
                      ? 'Upload and publish'
                      : 'Upload as draft'}
              </AlButton>
              {reel ? (
                <>
                  {reel.status !== 'PUBLISHED' ? (
                    <AlButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      data-testid="discovery-reel-sheet-publish"
                      title={hasChanges ? 'Save or discard your edits first.' : undefined}
                      disabled={isBusy || hasChanges}
                      onClick={() => {
                        onOpenChange(false);
                        onRequestTransition(reel, 'publish');
                      }}
                    >
                      Publish
                    </AlButton>
                  ) : (
                    <AlButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      data-testid="discovery-reel-sheet-unpublish"
                      disabled={isBusy}
                      onClick={() => {
                        onOpenChange(false);
                        onRequestTransition(reel, 'unpublish');
                      }}
                    >
                      Unpublish
                    </AlButton>
                  )}
                  {reel.status !== 'ARCHIVED' ? (
                    <AlButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      data-testid="discovery-reel-sheet-archive"
                      disabled={isBusy}
                      onClick={() => {
                        onOpenChange(false);
                        onRequestTransition(reel, 'archive');
                      }}
                    >
                      Archive
                    </AlButton>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
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
      <div className="admin-form-stack">
        {isEdit && liveReel ? (
          <AdminDetailSection title="Preview">
            <div className="discovery-preview">
              {liveReel.playbackUrl ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption -- internal editorial preview of an uploaded reel; no caption track exists in the media pipeline
                <video
                  className="discovery-preview__video"
                  controls
                  preload="metadata"
                  src={liveReel.playbackUrl}
                  poster={liveReel.thumbUrl ?? undefined}
                  data-testid="discovery-reel-preview-video"
                />
              ) : (
                <div className="discovery-preview__empty">
                  {detail.isLoading
                    ? 'Loading preview…'
                    : detail.isError
                      ? 'Preview unavailable — could not load a signed playback URL.'
                      : 'No playback URL returned for this reel.'}
                </div>
              )}
              <div className="discovery-preview__meta">
                <AdminDetailGrid>
                  <AdminDetailField
                    label="Status"
                    value={<DiscoveryReelStatusBadge status={liveReel.status} />}
                  />
                  <AdminDetailField label="Stable key" value={liveReel.stableKey} mono />
                  <AdminDetailField
                    label="Published"
                    value={formatDiscoveryDateTime(liveReel.publishedAt)}
                  />
                  <AdminDetailField
                    label="Updated"
                    value={formatDiscoveryDateTime(liveReel.updatedAt)}
                  />
                  <AdminDetailField label="Reel ID" value={shortAdminId(liveReel.reelId)} mono />
                  <AdminDetailField
                    label="Linked partner"
                    value={
                      liveReel.partnerOrgId ? shortAdminId(liveReel.partnerOrgId) : 'Not linked'
                    }
                    mono={Boolean(liveReel.partnerOrgId)}
                  />
                </AdminDetailGrid>
              </div>
            </div>
          </AdminDetailSection>
        ) : null}

        {liveReel ? (
          <AdminDetailSection title="Engagement" description="Live totals — read-only.">
            <div className="discovery-metrics" data-testid="discovery-reel-metrics">
              <div className="discovery-metric">
                <span className="discovery-metric__value">{formatCount(liveReel.viewCount)}</span>
                <span className="discovery-metric__label">Views</span>
              </div>
              <div className="discovery-metric">
                <span className="discovery-metric__value">{formatCount(liveReel.likeCount)}</span>
                <span className="discovery-metric__label">Likes</span>
              </div>
              <div className="discovery-metric">
                <span className="discovery-metric__value">
                  {formatCount(liveReel.commentCount)}
                </span>
                <span className="discovery-metric__label">Comments</span>
              </div>
              <div className="discovery-metric">
                <span className="discovery-metric__value">
                  {formatCount(liveReel.bookmarkCount)}
                </span>
                <span className="discovery-metric__label">Saves</span>
              </div>
            </div>
          </AdminDetailSection>
        ) : null}

        {canWrite ? (
          <form
            id="discovery-reel-form"
            className="admin-form-stack"
            onSubmit={(event) => {
              void onSubmit(event);
            }}
          >
            <div className="admin-form-grid">
              <Controller
                control={form.control}
                name="stableKey"
                render={({ field, fieldState }) => (
                  <label className="admin-field">
                    Stable key
                    <input
                      data-testid="discovery-reel-stable-key"
                      autoComplete="off"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      disabled={isBusy || isEdit}
                    />
                    {fieldState.error?.message ? (
                      <span className="admin-form-error">{fieldState.error.message}</span>
                    ) : (
                      <span className="admin-field__hint">
                        {isEdit
                          ? 'Fixed after creation.'
                          : 'Unique key used across environments — e.g. al-reel-11.'}
                      </span>
                    )}
                  </label>
                )}
              />
              <Controller
                control={form.control}
                name="sortOrder"
                render={({ field, fieldState }) => (
                  <label className="admin-field">
                    Feed order
                    <input
                      type="number"
                      data-testid="discovery-reel-sort-order"
                      value={Number.isNaN(field.value) ? '' : field.value}
                      onChange={(event) => {
                        field.onChange(
                          event.target.value === '' ? Number.NaN : event.target.valueAsNumber,
                        );
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      disabled={isBusy}
                    />
                    {fieldState.error?.message ? (
                      <span className="admin-form-error">{fieldState.error.message}</span>
                    ) : (
                      <span className="admin-field__hint">Position in the feed ordering.</span>
                    )}
                  </label>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <label className="admin-field admin-form-span">
                  Title
                  <input
                    data-testid="discovery-reel-title"
                    autoComplete="off"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={isBusy}
                  />
                  {fieldState.error?.message ? (
                    <span className="admin-form-error">{fieldState.error.message}</span>
                  ) : null}
                </label>
              )}
            />

            <Controller
              control={form.control}
              name="caption"
              render={({ field, fieldState }) => (
                <DiscoveryTextArea
                  className="admin-form-span"
                  label="Caption"
                  data-testid="discovery-reel-caption"
                  rows={4}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  disabled={isBusy}
                />
              )}
            />

            <div className="admin-form-grid">
              <Controller
                control={form.control}
                name="partnerOrgId"
                render={({ field, fieldState }) => (
                  <label className="admin-field">
                    Linked partner (optional)
                    <input
                      data-testid="discovery-reel-partner-org-id"
                      autoComplete="off"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      disabled={isBusy}
                    />
                    {fieldState.error?.message ? (
                      <span className="admin-form-error">{fieldState.error.message}</span>
                    ) : (
                      <span className="admin-field__hint">
                        Optional Garage or Store partner for AutoClip attribution. Leave blank if
                        unlinked; clear and save to unlink.
                      </span>
                    )}
                  </label>
                )}
              />
              <FileField
                label={isEdit ? 'Replace video (MP4)' : 'Video (MP4)'}
                helperText={`MP4 only, up to ${String(REEL_MAX_BYTES / (1024 * 1024))} MB.`}
                accept="video/mp4"
                file={videoFile}
                errorText={videoError}
                disabled={isBusy}
                testId="discovery-reel-video-file"
                onChange={pickVideo}
              />
              <FileField
                label={isEdit ? 'Replace poster' : 'Poster (optional)'}
                helperText="JPEG, PNG or WebP. Shown as the reel thumbnail."
                accept="image/jpeg,image/png,image/webp"
                file={posterFile}
                errorText={posterError}
                disabled={isBusy}
                testId="discovery-reel-poster-file"
                onChange={pickPoster}
              />
            </div>

            {isEdit && reel.thumbMediaId && !posterFile ? (
              <AlCheckbox
                label="Remove poster"
                helperText="Clears the thumbnail; the app falls back to its default."
                checked={removePoster}
                disabled={isBusy}
                onChange={(event) => {
                  setRemovePoster(event.target.checked);
                }}
              />
            ) : null}

            {!isEdit ? (
              <Controller
                control={form.control}
                name="publishNow"
                render={({ field }) => (
                  <AlCheckbox
                    label="Publish immediately"
                    helperText="Off = saved as a draft. On = live in the consumer feed as soon as the upload finishes."
                    checked={field.value}
                    disabled={isBusy}
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                    }}
                  />
                )}
              />
            ) : null}

            {isBusy ? (
              <AlText tone="muted" role="status">
                {STAGE_LABEL[stage]}
              </AlText>
            ) : null}
            {flowError ? <p className="admin-form-error">{flowError}</p> : null}
          </form>
        ) : null}
      </div>
    </AlModal>
  );
}
