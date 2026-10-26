import type {
  AdminDailyDriveStatus,
  AdminDailyDriveTransition,
  AdminDailyDriveVideoDto,
  CreateAdminDailyDriveVideoBody,
  UpdateAdminDailyDriveVideoBody,
} from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { discoveryQueryKeys } from '@/hooks/discovery/discovery-query-keys';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  createDailyDriveVideo,
  describeDailyDriveReadError,
  fetchDailyDriveVideos,
  transitionDailyDriveVideo,
  updateDailyDriveVideo,
} from '@/services/discovery/admin-daily-drive-service';

export type DailyDriveStatusFilter = AdminDailyDriveStatus | 'ALL';

const dailyDriveKey = () => [...discoveryQueryKeys.all, 'daily-drive'] as const;

const TRANSITION_TOAST: Record<
  AdminDailyDriveTransition,
  (video: AdminDailyDriveVideoDto) => string
> = {
  publish: (video) => `"${video.title}" is live in the consumer Daily Drive.`,
  unpublish: (video) => `"${video.title}" is back to draft.`,
  archive: (video) => `"${video.title}" is archived.`,
};

export function useDailyDriveVideos() {
  const canRead = useAdminPermission('discovery:read');
  const [status, setStatus] = useState<DailyDriveStatusFilter>('ALL');

  const query = useQuery({
    queryKey: [...dailyDriveKey(), 'list', status] as const,
    queryFn: ({ signal }) => fetchDailyDriveVideos(status === 'ALL' ? undefined : status, signal),
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load Daily Drive videos.' },
  });

  return {
    ...query,
    videos: query.data ?? [],
    status,
    setStatus,
    userErrorMessage: query.isError ? describeDailyDriveReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useDailyDriveMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: dailyDriveKey() });

  const createMutation = useMutation({
    mutationFn: (body: CreateAdminDailyDriveVideoBody) => createDailyDriveVideo(body),
    retry: 0,
    onSuccess: async (video) => {
      await invalidate();
      showSuccessToast(
        video.status === 'PUBLISHED'
          ? `Added and published "${video.title}".`
          : `Added "${video.title}" as a draft.`,
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ videoId, body }: { videoId: string; body: UpdateAdminDailyDriveVideoBody }) =>
      updateDailyDriveVideo(videoId, body),
    retry: 0,
    onSuccess: async (video) => {
      await invalidate();
      showSuccessToast(`Saved "${video.title}".`);
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({
      videoId,
      transition,
    }: {
      videoId: string;
      transition: AdminDailyDriveTransition;
    }) => transitionDailyDriveVideo(videoId, transition),
    retry: 0,
    onSuccess: async (video, variables) => {
      await invalidate();
      showSuccessToast(TRANSITION_TOAST[variables.transition](video));
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:daily-drive-transition', toast: true });
    },
  });

  return { createMutation, updateMutation, transitionMutation };
}
