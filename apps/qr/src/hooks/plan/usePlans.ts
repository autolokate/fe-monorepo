import { useCallback, useState } from 'react';

import {
  ensurePlansLoaded,
  getPlansRevision,
  type LoadPlansOptions,
  type LoadPlansResult,
} from '@/services/plan/plan-service';

export function usePlans() {
  const [revision, setRevision] = useState(() => getPlansRevision());
  const [isPending, setIsPending] = useState(false);

  const loadPlans = useCallback(async (options?: LoadPlansOptions): Promise<LoadPlansResult> => {
    setIsPending(true);
    try {
      const result = await ensurePlansLoaded(options);
      if (result.ok) {
        setRevision(getPlansRevision());
      }
      return result;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { loadPlans, ensurePlansLoaded: loadPlans, revision, isPending };
}
