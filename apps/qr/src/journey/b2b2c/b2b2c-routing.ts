import {
  buildB2b2cPaths,
  parseJourneyIdFromPathname,
  ROUTE_NAMESPACE,
} from '../routing/journey-url-routing';

function readJourneyIdFromUrl(): string {
  if (typeof window === 'undefined') {
    return '_';
  }
  return parseJourneyIdFromPathname(window.location.pathname) ?? '_';
}

export const b2b2cJourneyPaths = new Proxy(
  {
    welcome: `${ROUTE_NAMESPACE.b2b2c}/welcome`,
    welcomePlanRider: `${ROUTE_NAMESPACE.b2b2c}/welcome/plan-rider`,
  },
  {
    get(_target, prop: string) {
      const paths = buildB2b2cPaths(readJourneyIdFromUrl());
      return paths[prop as keyof typeof paths];
    },
  },
);
