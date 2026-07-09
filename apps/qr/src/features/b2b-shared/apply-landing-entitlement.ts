import type { JourneySession } from '../../journey/types.js';

import type { LandingEntitlement } from './types-landing.js';

/** Seeds purchase + vehicle session so emergency limits resolve from landing entitlement. */
export function applyLandingEntitlementToSession(
  entitlement: LandingEntitlement,
): Partial<JourneySession> {
  return {
    purchase: {
      selectedPlanId: entitlement.planId,
      riderCount: entitlement.riderCount,
    },
    vehicle: {
      plate: entitlement.vehiclePlate,
      confirmed: true,
    },
  };
}
