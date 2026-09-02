import { Navigate, useLocation } from 'react-router-dom';

import { ROUTE_NAMESPACE } from '../routing/journey-url-routing';

/**
 * Legacy `/pwa/scan/:qrCode/*` → canonical `/scan/:qrCode/*`.
 * Preserves suffix (vehicle, sos, park-me, …) and query/hash.
 */
export function LegacyPwaScanRedirect() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/pwa\/scan\/?/, '');
  const pathname = suffix
    ? `${ROUTE_NAMESPACE.scan}/${suffix}`
    : ROUTE_NAMESPACE.scan;

  return (
    <Navigate
      to={{
        pathname,
        search: location.search,
        hash: location.hash,
      }}
      replace
    />
  );
}
