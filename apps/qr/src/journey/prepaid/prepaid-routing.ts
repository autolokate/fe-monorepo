import {
  buildPrepaidPaths,
  parseJourneyIdFromPathname,
  ROUTE_NAMESPACE,
} from '../routing/journey-url-routing';

function readJourneyIdFromUrl(): string {
  if (typeof window === 'undefined') {
    return '_';
  }
  return parseJourneyIdFromPathname(window.location.pathname) ?? '_';
}

export const prepaidJourneyPaths = new Proxy(
  { welcome: `${ROUTE_NAMESPACE.prepaid}/welcome` },
  {
    get(target, prop: string) {
      if (prop === 'welcome') {
        return buildPrepaidPaths(readJourneyIdFromUrl()).welcome;
      }
      return target[prop as keyof typeof target];
    },
  },
);

export function prepaidWelcomePath(journeyId: string): string {
  return buildPrepaidPaths(journeyId).welcome;
}
