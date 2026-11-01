import { isStepUpRequiredError } from '@autolokate/api-client';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { notifyAdminStepUpRequired } from '@/platform/api/admin-api-client';

/** Any admin call refused for a missing `step_up` claim re-opens the step-up prompt. */
function handleGlobalError(error: unknown): void {
  if (isStepUpRequiredError(error)) {
    notifyAdminStepUpRequired();
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGlobalError }),
  mutationCache: new MutationCache({ onError: handleGlobalError }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => !isStepUpRequiredError(error) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export { queryClient };
