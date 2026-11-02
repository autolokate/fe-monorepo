import type { AdminVehicleDriversDto } from '@autolokate/api-client';
import { useQuery } from '@tanstack/react-query';

import { isAdminRouteNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchVehicleDrivers } from '@/services/users/admin-users-service';

import type { AdminReadState } from './useAdminUserConsumerState';

/** Owner + driver roster for one vehicle (`GET /admin/v1/vehicles/{vehicleId}/drivers`). */
export function useAdminVehicleDrivers(vehicleId: string | null) {
  const enabled = typeof vehicleId === 'string' && vehicleId.length > 0;
  const query = useQuery({
    queryKey: ['admin', 'vehicles', 'drivers', vehicleId],
    queryFn: ({ signal }) => {
      if (!vehicleId) throw new Error('vehicleId required');
      return fetchVehicleDrivers(vehicleId, signal);
    },
    enabled,
    retry: 0,
  });
  const notDeployed = isAdminRouteNotDeployed(query.error);
  const state: AdminReadState<AdminVehicleDriversDto> = {
    data: query.data ?? null,
    isLoading: enabled && query.isLoading,
    notDeployed,
    error: query.error && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
  };
  return {
    state,
    isFetching: query.isFetching,
    refresh: () => {
      void query.refetch();
    },
  };
}
