import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { getAuthRouteProgress } from './auth-route-progress.js';
import { getPurchaseRouteProgress } from './purchase-route-progress.js';
import type { RouteProgressConfig } from './route-progress.types.js';

export function useAuthRouteProgress(): RouteProgressConfig | null {
  const { pathname } = useLocation();
  return useMemo(() => getAuthRouteProgress(pathname), [pathname]);
}

export function usePurchaseRouteProgress(): RouteProgressConfig | null {
  const { pathname } = useLocation();
  return useMemo(() => getPurchaseRouteProgress(pathname), [pathname]);
}
