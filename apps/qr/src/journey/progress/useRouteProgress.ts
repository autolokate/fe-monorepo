import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { getAuthRouteProgress } from './auth-route-progress';
import { getPurchaseRouteProgress } from './purchase-route-progress';
import type { RouteProgressConfig } from './route-progress.types';

export function useAuthRouteProgress(): RouteProgressConfig | null {
  const { pathname } = useLocation();
  return useMemo(() => getAuthRouteProgress(pathname), [pathname]);
}

export function usePurchaseRouteProgress(): RouteProgressConfig | null {
  const { pathname } = useLocation();
  return useMemo(() => getPurchaseRouteProgress(pathname), [pathname]);
}
