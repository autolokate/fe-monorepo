import { Navigate, useSearchParams } from 'react-router-dom';

import { resolvePurchaseEntryPath } from '../state/purchase-journey-state-machine';
import { useActiveJourneyId } from '../routing/use-active-journey-id';
import { buildQrEntryPath } from '../routing/journey-url-routing';

export function PurchaseIndexRedirect() {
  const [searchParams] = useSearchParams();
  const journeyId = useActiveJourneyId();

  if (!journeyId) {
    return <Navigate to={buildQrEntryPath('')} replace />;
  }

  return <Navigate to={resolvePurchaseEntryPath(searchParams, journeyId)} replace />;
}
