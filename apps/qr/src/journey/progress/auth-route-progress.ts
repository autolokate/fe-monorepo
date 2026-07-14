import { authJourneyPaths } from '../auth/auth-routing';

import type { RouteProgressConfig } from './route-progress.types';

/** Shared Auth sub-flow — Mobile (1), OTP (2), Name (3). Figma: 3 segment bars only. */
export const SHARED_AUTH_PROGRESS_TOTAL = 3;

/** Source of truth: path → progress (Shared Auth). */
export const authRouteProgressByPath: Record<string, RouteProgressConfig> = {
  [authJourneyPaths.mobile]: {
    step: 1,
    total: SHARED_AUTH_PROGRESS_TOTAL,
    showProgress: true,
    showMeta: false,
  },
  [authJourneyPaths.otp]: {
    step: 2,
    total: SHARED_AUTH_PROGRESS_TOTAL,
    showProgress: true,
    showMeta: false,
  },
  [authJourneyPaths.vehicleOwner]: {
    step: 3,
    total: SHARED_AUTH_PROGRESS_TOTAL,
    showProgress: false,
    showMeta: false,
  },
};

export function getAuthRouteProgress(pathname: string): RouteProgressConfig | null {
  const normalized = pathname.replace(/\/+$/, '');
  return authRouteProgressByPath[normalized] ?? null;
}
