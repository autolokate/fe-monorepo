import { useQuery } from '@tanstack/react-query';

import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchVehiclesByPlate } from '@/services/users/admin-users-v4-service';

/** Registrations shorter than this can't form a plate key — don't ask the server. */
export const PLATE_SEARCH_MIN_LENGTH = 4;

/** `GET /admin/v1/vehicles?plate=` — exact match on the normalized plate key. */
export function useVehiclePlateSearch(plate: string) {
  const trimmed = plate.trim();
  const enabled = trimmed.replace(/[^a-z0-9]/gi, '').length >= PLATE_SEARCH_MIN_LENGTH;
  const query = useQuery({
    queryKey: ['admin', 'vehicles', 'plate-search', trimmed.toUpperCase()],
    queryFn: ({ signal }) => fetchVehiclesByPlate(trimmed, signal),
    enabled,
    retry: 0,
  });
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    enabled,
    vehicles: query.data ?? [],
    isLoading: enabled && query.isLoading,
    isFetching: query.isFetching,
    searched: enabled && query.data !== undefined,
    notDeployed,
    error: query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
