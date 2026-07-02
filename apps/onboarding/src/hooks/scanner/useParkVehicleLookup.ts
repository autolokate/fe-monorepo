import { useCallback, useState } from 'react';

import { lookupParkReporterVehicle } from '@/services/scanner/index.js';

export function useParkVehicleLookup() {
  const [isPending, setIsPending] = useState(false);

  const lookupReporterVehicle = useCallback(async (plate: string) => {
    setIsPending(true);
    try {
      return await lookupParkReporterVehicle(plate);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { lookupReporterVehicle, isPending };
}
