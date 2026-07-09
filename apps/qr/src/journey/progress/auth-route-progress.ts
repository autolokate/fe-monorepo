import { journeyPaths } from '../constants.js';

import type { RouteProgressConfig } from './route-progress.types.js';

/** Shared Auth sub-flow — Mobile (1), OTP (2), Name (3). Figma: 3 segment bars only. */
export const SHARED_AUTH_PROGRESS_TOTAL = 3;

/** Source of truth: path → progress (Shared Auth). */
export const authRouteProgressByPath: Record<string, RouteProgressConfig> = {
  [`${journeyPaths.auth}/mobile`]: {
    step: 1,
    total: SHARED_AUTH_PROGRESS_TOTAL,
    showProgress: true,
    showMeta: false,
  },
  [`${journeyPaths.auth}/otp`]: {
    step: 2,
    total: SHARED_AUTH_PROGRESS_TOTAL,
    showProgress: true,
    showMeta: false,
  },
  [`${journeyPaths.auth}/vehicle-owner`]: {
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

