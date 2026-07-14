import { useLocation } from 'react-router-dom';

import { PurchaseRouteHydrationProvider } from '../../hooks/purchase/usePurchaseRouteHydration';
import { purchaseJourneyPaths } from '../purchase/purchase-paths-runtime';
import { PurchaseSegmentBootstrap } from './purchase/purchase-route-shared';
import { resolvePurchaseRouteContent } from './purchase/purchase-route-resolve';

export function PurchaseRoutes() {
  const { pathname } = useLocation();

  return (
    <PurchaseRouteHydrationProvider>
      <PurchaseSegmentBootstrap>
        {resolvePurchaseRouteContent(pathname)}
      </PurchaseSegmentBootstrap>
    </PurchaseRouteHydrationProvider>
  );
}

export { purchaseJourneyPaths };
