import type {
  AdminDiscoveryReelDto,
  CreateAdminReelBody,
  UpdateAdminReelBody,
} from '@autolokate/api-client';
import { z } from 'zod';

/** Mirrors `media-policy.ts` DISCOVERY_REEL on the BE: 40 MiB cap, mp4 video + jpeg/png/webp poster. */
export const REEL_MAX_BYTES = 40 * 1024 * 1024;
export const REEL_VIDEO_TYPES = ['video/mp4'] as const;
export const REEL_POSTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const uuidOrEmpty = z
  .string()
  .trim()
  .refine(
    (v) =>
      v === '' ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v),
    'Enter a valid partner reference, or leave blank to unlink.',
  );

export const reelFormSchema = z.object({
  stableKey: z
    .string()
    .trim()
    .min(3, 'Stable key needs at least 3 characters.')
    .max(64, 'Stable key is too long (64 max).')
    .regex(/^[A-Za-z0-9._-]+$/, 'Use letters, digits, dot, dash or underscore — e.g. al-reel-11.'),
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Title is too long (200 max).'),
  caption: z.string().trim().max(2000, 'Caption is too long (2000 max).'),
  sortOrder: z
    .number({ message: 'Feed order must be a whole number.' })
    .int('Feed order must be a whole number.'),
  publishNow: z.boolean(),
  /** Blank = unlinked; UUID = Garage/Store partner org (0086). */
  partnerOrgId: uuidOrEmpty,
});

export type ReelFormValues = z.infer<typeof reelFormSchema>;

export const EMPTY_REEL_FORM: ReelFormValues = {
  stableKey: '',
  title: '',
  caption: '',
  sortOrder: 0,
  publishNow: false,
  partnerOrgId: '',
};

export function reelToFormValues(reel: AdminDiscoveryReelDto): ReelFormValues {
  return {
    stableKey: reel.stableKey,
    title: reel.title,
    caption: reel.caption,
    sortOrder: reel.sortOrder,
    publishNow: reel.status === 'PUBLISHED',
    partnerOrgId: reel.partnerOrgId ?? '',
  };
}

export function validateReelFile(
  file: File,
  allowedTypes: readonly string[],
  noun: 'video' | 'poster',
): string | null {
  if (!allowedTypes.includes(file.type)) {
    return noun === 'video'
      ? 'Video must be an MP4 (video/mp4).'
      : 'Poster must be a JPEG, PNG or WebP image.';
  }
  if (file.size <= 0) {
    return 'This file is empty.';
  }
  if (file.size > REEL_MAX_BYTES) {
    return `File is too large — the limit is ${String(REEL_MAX_BYTES / (1024 * 1024))} MB.`;
  }
  return null;
}

export function toCreateReelBody(
  values: ReelFormValues,
  media: { videoMediaId: string; thumbMediaId?: string },
): CreateAdminReelBody {
  const partnerOrgId = values.partnerOrgId.trim();
  return {
    stableKey: values.stableKey,
    title: values.title,
    ...(values.caption ? { caption: values.caption } : {}),
    videoMediaId: media.videoMediaId,
    ...(media.thumbMediaId ? { thumbMediaId: media.thumbMediaId } : {}),
    sortOrder: values.sortOrder,
    publish: values.publishNow,
    ...(partnerOrgId ? { partnerOrgId } : {}),
  };
}

/** Only changed metadata + any newly uploaded media — status moves through Publish / Unpublish / Archive. */
export function toUpdateReelBody(
  values: ReelFormValues,
  original: AdminDiscoveryReelDto,
  media: { videoMediaId?: string; thumbMediaId?: string; removePoster: boolean },
): UpdateAdminReelBody {
  const body: UpdateAdminReelBody = {};
  if (values.title !== original.title) {
    body.title = values.title;
  }
  if (values.caption !== original.caption) {
    body.caption = values.caption;
  }
  if (values.sortOrder !== original.sortOrder) {
    body.sortOrder = values.sortOrder;
  }
  if (media.videoMediaId) {
    body.videoMediaId = media.videoMediaId;
  }
  if (media.thumbMediaId) {
    body.thumbMediaId = media.thumbMediaId;
  } else if (media.removePoster && original.thumbMediaId) {
    body.thumbMediaId = null;
  }
  const nextPartner = values.partnerOrgId.trim();
  const prevPartner = original.partnerOrgId ?? '';
  if (nextPartner !== prevPartner) {
    body.partnerOrgId = nextPartner.length > 0 ? nextPartner : null;
  }
  return body;
}
