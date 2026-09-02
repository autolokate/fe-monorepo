import type { LandingEntitlement } from './types-landing';
import { formatWelcomeRiderRowLabel } from './b2b-welcome-copy';

export type WelcomePlanDisplay = {
  planName: string;
  priceDisplay?: string;
  includesLabel?: string;
  features: readonly string[];
  riderRowLabel?: string;
};

/**
 * Welcome card copy from GET /v1/activation/preview.
 * Never invents features or includes labels when the API omitted them.
 */
export function resolveWelcomePlanDisplay(entitlement: LandingEntitlement): WelcomePlanDisplay {
  return {
    planName: entitlement.planName.trim(),
    priceDisplay: entitlement.priceDisplay || undefined,
    features: entitlement.features,
    riderRowLabel: formatWelcomeRiderRowLabel(entitlement.riderCount),
  };
}
