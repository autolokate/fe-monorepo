import { useCallback, useState } from 'react';

import { lookupVehicleByPlate } from '@/services/vehicle/vehicle-service.js';

export function useVehicleLookup() {
  const [isPending, setIsPending] = useState(false);

  const lookupVehicle = useCallback(async (plate: string) => {
    setIsPending(true);
    try {
      return await lookupVehicleByPlate(plate);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { lookupVehicle, isPending };
}
