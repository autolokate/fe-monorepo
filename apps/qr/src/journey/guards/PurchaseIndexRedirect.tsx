import { Navigate, useSearchParams } from 'react-router-dom';

import { resolvePurchaseEntryPath } from '../state/purchase-journey-state-machine.js';

export function PurchaseIndexRedirect() {
  const [searchParams] = useSearchParams();
  return <Navigate to={resolvePurchaseEntryPath(searchParams)} replace />;
}
