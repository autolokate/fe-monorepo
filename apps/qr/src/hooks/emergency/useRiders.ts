import { useCallback, useState } from 'react';

import type { EmergencyRider } from '@/features/emergency/types';
import type { ActivationFlowId } from '@/journey/types';
import {
  createRider,
  deleteRider,
  getRidersRevision,
  loadSubscriptionRiders,
  peekStoredRiders,
  requestRiderOtp,
  verifyRiderOtp,
  type RiderCreateResult,
  type RiderDeleteResult,
  type RiderListResult,
  type RiderOtpResult,
  type RiderVerifyResult,
} from '@/services/rider/rider-service';

export function useRiders(selectedFlow: ActivationFlowId | null) {
  const [revision, setRevision] = useState(() => getRidersRevision());

  const refresh = useCallback(
    async (force = false): Promise<RiderListResult> => {
      const result = await loadSubscriptionRiders(selectedFlow, { force });
      if (result.ok) {
        setRevision(result.revision);
      }
      return result;
    },
    [selectedFlow],
  );

  const requestOtp = useCallback(async (mobileDigits: string): Promise<RiderOtpResult> => {
    return requestRiderOtp(mobileDigits);
  }, []);

  const verifyOtp = useCallback(
    async (mobileDigits: string, code: string): Promise<RiderVerifyResult> => {
      return verifyRiderOtp(mobileDigits, code);
    },
    [],
  );

  const addRider = useCallback(
    async (name: string, relation: EmergencyRider['relation']): Promise<RiderCreateResult> => {
      const result = await createRider(selectedFlow, name, relation);
      if (result.ok) {
        setRevision(result.revision);
      }
      return result;
    },
    [selectedFlow],
  );

  const removeRider = useCallback(
    async (riderId: string): Promise<RiderDeleteResult> => {
      const result = await deleteRider(selectedFlow, riderId);
      if (result.ok) {
        setRevision(result.revision);
      }
      return result;
    },
    [selectedFlow],
  );

  return {
    riders: peekStoredRiders(),
    revision,
    refresh,
    requestOtp,
    verifyOtp,
    addRider,
    removeRider,
  };
}
