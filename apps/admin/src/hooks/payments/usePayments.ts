import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  toPaymentsQueryOutcome,
  type PaymentsOutcomeFilter,
} from '@/features/payments/payments-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchPaymentsPage } from '@/services/payments/payments-service';

export const paymentsQueryKeys = {
  all: ['admin', 'payments'] as const,
  list: (outcomeFilter: PaymentsOutcomeFilter) =>
    [...paymentsQueryKeys.all, { outcome: toPaymentsQueryOutcome(outcomeFilter) }] as const,
};

export function usePayments(initialOutcomeFilter: PaymentsOutcomeFilter = 'ALL') {
  const [outcomeFilter, setOutcomeFilter] = useState<PaymentsOutcomeFilter>(initialOutcomeFilter);

  const query = useQuery({
    queryKey: paymentsQueryKeys.list(outcomeFilter),
    queryFn: ({ signal }) =>
      fetchPaymentsPage({ outcome: toPaymentsQueryOutcome(outcomeFilter) }, signal),
    meta: { errorMessage: 'Unable to load payments.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'payments', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const payments = query.data?.items ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    payments,
    outcomeFilter,
    setOutcomeFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
