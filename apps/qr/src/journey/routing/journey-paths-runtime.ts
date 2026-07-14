import { buildAuthPaths, parseJourneyIdFromPathname } from '../routing/journey-url-routing';
import { buildEmergencyPaths } from '../routing/journey-url-routing';

import { resolvePartnerWelcomePath } from '@/journey/state/partner-journey-state-machine';

function readJourneyId(): string {
  if (typeof window === 'undefined') {
    return '_';
  }
  return parseJourneyIdFromPathname(window.location.pathname) ?? '_';
}

/** Runtime emergency paths from URL journey id. */
export const emergencyJourneyPaths = new Proxy(
  {} as ReturnType<typeof buildEmergencyPaths>,
  {
    get(_target, prop: string) {
      const paths = buildEmergencyPaths(readJourneyId());
      return paths[prop as keyof typeof paths];
    },
  },
);

export function emergencyJourneyPathsFor(journeyId: string) {
  return buildEmergencyPaths(journeyId);
}

export function authMobileUrlFromUrl(options?: { continueAuth?: boolean }): string {
  const journeyId = readJourneyId();
  const paths = buildAuthPaths(journeyId);
  if (!options?.continueAuth) {
    return paths.mobile;
  }
  const params = new URLSearchParams({ auth: 'continue' });
  return `${paths.mobile}?${params.toString()}`;
}

export { resolvePartnerWelcomePath };
