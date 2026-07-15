import { isPurchaseRoutePath } from '../purchase/purchase-routing';

import type { RouteProgressConfig } from './route-progress.types';

/** Figma Consumer · QR Activation + Purchase — no step progress bar on any purchase frame. */
export function getPurchaseRouteProgress(pathname: string): RouteProgressConfig | null {
  const normalized = pathname.replace(/\/+$/, '');
  if (!isPurchaseRoutePath(normalized)) {
    return null;
  }
  return null;
}
