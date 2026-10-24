import type { AdminUserDetailDto, AdminUserVehicleDto } from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import {
  fetchUserDetail,
  fetchUserVehicles,
  updateUser,
} from '@/services/users/admin-users-service';

export function useAdminUserDetail(userId: string | null) {
  const queryClient = useQueryClient();
  const enabled = typeof userId === 'string' && userId.length > 0;

  const detailQuery = useQuery({
    queryKey: ['admin', 'users', 'detail', userId],
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return fetchUserDetail(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const vehiclesQuery = useQuery({
    queryKey: ['admin', 'users', 'vehicles', userId],
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return fetchUserVehicles(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const patchMutation = useMutation({
    mutationFn: (body: { locale?: string; fraudFlagged?: boolean }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return updateUser(userId, body);
    },
    retry: 0,
    onSuccess: async () => {
      showSuccessToast('Account updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'users:patch', toast: true });
    },
  });

  const detail: AdminUserDetailDto | null = detailQuery.data ?? null;
  const vehicles: AdminUserVehicleDto[] = vehiclesQuery.data ?? [];

  return {
    detail,
    vehicles,
    isLoading: detailQuery.isLoading,
    isFetching: detailQuery.isFetching || vehiclesQuery.isFetching,
    detailError: detailQuery.error ? mapAdminApiError(detailQuery.error).userMessage : null,
    vehiclesError: vehiclesQuery.error ? mapAdminApiError(vehiclesQuery.error).userMessage : null,
    vehiclesLoading: vehiclesQuery.isLoading,
    patchMutation,
    refresh: () => {
      void detailQuery.refetch();
      void vehiclesQuery.refetch();
    },
  };
}
