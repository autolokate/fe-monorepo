import type {
  AdminCommunityQuestionDto,
  AdminDiscoveryReelDto,
  AdminReelTransition,
  CreateAdminCommunityQuestionBody,
  CreateAdminReelBody,
  UpdateAdminCommunityQuestionBody,
  UpdateAdminReelBody,
} from '@autolokate/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { discoveryQueryKeys } from '@/hooks/discovery/discovery-query-keys';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import {
  createDiscoveryQuestion,
  createDiscoveryReel,
  transitionDiscoveryReel,
  updateDiscoveryQuestion,
  updateDiscoveryReel,
} from '@/services/discovery/admin-discovery-service';
import { describeDiscoverySubmitError } from '@/services/discovery/discovery-errors';

const REEL_TRANSITION_TOAST: Record<AdminReelTransition, (reel: AdminDiscoveryReelDto) => string> =
  {
    publish: (reel) => `"${reel.title}" is published to the consumer feed.`,
    unpublish: (reel) => `"${reel.title}" is unpublished (draft).`,
    archive: (reel) => `"${reel.title}" is archived.`,
  };

export function useDiscoveryMutations() {
  const queryClient = useQueryClient();

  const invalidateQuestions = async () => {
    await queryClient.invalidateQueries({ queryKey: discoveryQueryKeys.questions() });
    await queryClient.invalidateQueries({ queryKey: discoveryQueryKeys.overview() });
  };

  const invalidateReels = async () => {
    await queryClient.invalidateQueries({ queryKey: discoveryQueryKeys.reels() });
    await queryClient.invalidateQueries({ queryKey: discoveryQueryKeys.overview() });
  };

  const createQuestionMutation = useMutation({
    mutationFn: ({
      body,
      signal,
    }: {
      body: CreateAdminCommunityQuestionBody;
      signal?: AbortSignal;
    }) => createDiscoveryQuestion(body, signal),
    retry: 0,
    onSuccess: async (question: AdminCommunityQuestionDto) => {
      await invalidateQuestions();
      showSuccessToast(
        question.status === 'VISIBLE'
          ? `Published "${question.title}".`
          : `Saved "${question.title}" as a hidden draft.`,
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:create-question', toast: true });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({
      questionId,
      body,
      signal,
    }: {
      questionId: string;
      body: UpdateAdminCommunityQuestionBody;
      signal?: AbortSignal;
    }) => updateDiscoveryQuestion(questionId, body, signal),
    retry: 0,
    onSuccess: async (question: AdminCommunityQuestionDto, variables) => {
      await invalidateQuestions();
      if (variables.body.status === 'VISIBLE') {
        showSuccessToast(`Published "${question.title}".`);
      } else if (variables.body.status === 'HIDDEN') {
        showSuccessToast(`Hid "${question.title}" from the consumer feed.`);
      } else {
        showSuccessToast(`Saved "${question.title}".`);
      }
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:update-question', toast: true });
    },
  });

  const createReelMutation = useMutation({
    mutationFn: ({ body, signal }: { body: CreateAdminReelBody; signal?: AbortSignal }) =>
      createDiscoveryReel(body, signal),
    retry: 0,
    onSuccess: async (reel: AdminDiscoveryReelDto) => {
      await invalidateReels();
      showSuccessToast(
        reel.status === 'PUBLISHED'
          ? `Created and published "${reel.title}".`
          : `Created "${reel.title}" as a draft.`,
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:create-reel', toast: true });
    },
  });

  const updateReelMutation = useMutation({
    mutationFn: ({
      reelId,
      body,
      signal,
    }: {
      reelId: string;
      body: UpdateAdminReelBody;
      signal?: AbortSignal;
    }) => updateDiscoveryReel(reelId, body, signal),
    retry: 0,
    onSuccess: async (reel: AdminDiscoveryReelDto) => {
      await queryClient.invalidateQueries({ queryKey: discoveryQueryKeys.reelDetail(reel.reelId) });
      await invalidateReels();
      showSuccessToast(`Saved "${reel.title}".`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:update-reel', toast: true });
    },
  });

  const transitionReelMutation = useMutation({
    mutationFn: ({
      reelId,
      transition,
      signal,
    }: {
      reelId: string;
      transition: AdminReelTransition;
      signal?: AbortSignal;
    }) => transitionDiscoveryReel(reelId, transition, signal),
    retry: 0,
    onSuccess: async (reel: AdminDiscoveryReelDto, variables) => {
      await invalidateReels();
      showSuccessToast(REEL_TRANSITION_TOAST[variables.transition](reel));
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:reel-transition', toast: true });
    },
  });

  return {
    createQuestionMutation,
    updateQuestionMutation,
    createReelMutation,
    updateReelMutation,
    transitionReelMutation,
    resolveSubmitError: describeDiscoverySubmitError,
  };
}
