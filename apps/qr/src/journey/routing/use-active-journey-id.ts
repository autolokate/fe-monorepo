import { useLocation, useParams } from 'react-router-dom';

import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';

import { parseJourneyIdFromPathname } from './journey-url-routing';
import { useOptionalJourneyScope } from './JourneyScopeProvider';

/** Active journey id from URL path, route params, or query — not localStorage. */
export function useActiveJourneyId(): string | null {
  const scope = useOptionalJourneyScope();
  const params = useParams<{ journeyId?: string; qrCode?: string }>();
  const location = useLocation();

  if (scope?.journeyId) {
    return scope.journeyId;
  }

  return (
    params.journeyId?.trim() ||
    params.qrCode?.trim() ||
    parseJourneyIdFromPathname(location.pathname) ||
    resolvePurchaseQrCode(new URLSearchParams(location.search))
  );
}

export function requireActiveJourneyId(journeyId: string | null): string {
  if (!journeyId?.trim()) {
    throw new Error('Missing journey id in URL');
  }
  return journeyId.trim();
}
