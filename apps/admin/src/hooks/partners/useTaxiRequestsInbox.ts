import type { AdminTaxiRequestInboxDto, AdminTaxiRequestStatus } from '@autolokate/api-client';
import { ApiError } from '@autolokate/api-client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import {
  PARTNERS_LIST_LIMIT,
  partnersQueryKeys,
  type TaxiRequestsListParams,
} from '@/hooks/partners/partners-query-keys';
import {
  isAdminRouteNotDeployed,
  mapAdminApiError,
  resolveSubmitErrorMessage,
} from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import { useUrlTextState } from '@/platform/state/useUrlTextState';
import {
  dateInputToExclusiveToIso,
  dateInputToFromIso,
  isDateRangeInverted,
} from '@/platform/utils/admin-date-range';
import {
  fetchAdminTaxiRequestsPage,
  submitAdminTaxiRequestClose,
} from '@/services/partners/admin-partners-service';
import { describePartnersReadError } from '@/services/partners/partners-errors';

export function useTaxiRequestsInbox() {
  const canRead = useAdminPermission('partners:read');
  const queryClient = useQueryClient();
  const [status, setStatus] = useUrlFilterState<AdminTaxiRequestStatus | 'ALL'>(
    'taxiStatus',
    'ALL',
  );
  const [pickupCity, setPickupCity] = useUrlTextState('taxiCity');
  const [pickupState, setPickupState] = useUrlTextState('taxiState');
  const [fromDay, setFromDay] = useUrlTextState('taxiFrom');
  const [toDay, setToDay] = useUrlTextState('taxiTo');
  const city = useDebouncedValue(pickupCity.trim(), 400);
  const state = useDebouncedValue(pickupState.trim(), 400);
  const inverted = isDateRangeInverted(fromDay, toDay);
  const from = dateInputToFromIso(fromDay);
  const to = dateInputToExclusiveToIso(toDay);

  const params = useMemo<TaxiRequestsListParams>(
    () => ({
      status,
      ...(city ? { pickupCity: city } : {}),
      ...(state ? { pickupState: state } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [status, city, state, from, to],
  );
  const hasFilters = Boolean(city || state || from || to);

  const query = useInfiniteQuery({
    queryKey: partnersQueryKeys.taxiRequestsList(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchAdminTaxiRequestsPage(
        {
          ...(status === 'ALL' ? {} : { status }),
          ...(city ? { pickupCity: city } : {}),
          ...(state ? { pickupState: state } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          limit: PARTNERS_LIST_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead && !inverted,
    retry: false,
    meta: { errorMessage: 'Unable to load taxi requests.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'partners:taxi-requests', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const requests = useMemo<AdminTaxiRequestInboxDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const close = useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      submitAdminTaxiRequestClose(input.id, input.reason),
    retry: 0,
    onSuccess: () => {
      showSuccessToast('Request closed. Bidders have been notified.');
      void queryClient.invalidateQueries({ queryKey: partnersQueryKeys.taxiRequests() });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'partners:taxi-request-close', toast: false });
    },
  });

  // A 400 from a filter (unknown city/state name) carries the server's explanation — show it inline.
  const isFilterError = query.isError && mapAdminApiError(query.error).status === 400;

  return {
    ...query,
    requests,
    status,
    setStatus,
    pickupCity,
    setPickupCity,
    pickupState,
    setPickupState,
    fromDay,
    setFromDay,
    toDay,
    setToDay,
    inverted,
    hasFilters,
    filterErrorMessage: isFilterError ? resolveSubmitErrorMessage(query.error) : null,
    userErrorMessage: query.isError ? describePartnersReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
    close,
    closeError: close.isError ? taxiCloseErrorMessage(close.error) : null,
  };
}

function taxiCloseErrorMessage(error: unknown): string {
  if (isAdminRouteNotDeployed(error))
    return 'Closing requests is not available on this server yet.';
  if (error instanceof ApiError && error.code === 'taxi_request_not_open') {
    return 'This request is no longer open (it may have been awarded, cancelled or expired). Refresh to see its state.';
  }
  return resolveSubmitErrorMessage(error);
}
