import { useCallback, useState } from 'react';

import { ensurePlansLoaded, getPlansRevision } from '@/services/plan/plan-service';

export function usePlans() {
  const [revision, setRevision] = useState(() => getPlansRevision());
  const [isPending, setIsPending] = useState(false);

  const loadPlans = useCallback(async () => {
    setIsPending(true);
    try {
      const result = await ensurePlansLoaded();
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
