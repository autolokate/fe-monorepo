import type { JourneySession } from '../../journey/types';

import type { LandingEntitlement } from './types-landing';

/** Seeds purchase (+ vehicle when preview includes a plate) from landing entitlement. */
export function applyLandingEntitlementToSession(
  entitlement: LandingEntitlement,
): Partial<JourneySession> {
  const plate = entitlement.vehiclePlate.trim();
  return {
    purchase: {
      selectedPlanId: entitlement.planId,
      riderCount: entitlement.riderCount,
    },
    ...(plate
      ? {
          vehicle: {
            plate,
            confirmed: true,
          },
        }
      : {}),
  };
}
