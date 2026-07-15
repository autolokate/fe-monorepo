import {
  buildEmergencyPaths,
  parseJourneyIdFromPathname,
  ROUTE_NAMESPACE,
} from '../routing/journey-url-routing';

export { buildEmergencyPaths };

function readJourneyIdFromUrl(): string {
  if (typeof window === 'undefined') {
    return '_';
  }
  return parseJourneyIdFromPathname(window.location.pathname) ?? '_';
}

export function emergencyJourneyPathsFor(journeyId: string) {
  return buildEmergencyPaths(journeyId);
}

/** Journey-scoped emergency paths from URL (not localStorage). */
export const emergencyJourneyPaths = new Proxy({} as ReturnType<typeof buildEmergencyPaths>, {
  get(_target, prop: string) {
    const paths = buildEmergencyPaths(readJourneyIdFromUrl());
    return paths[prop as keyof typeof paths];
  },
});

export type EmergencyJourneyPath = ReturnType<typeof buildEmergencyPaths>[keyof ReturnType<
  typeof buildEmergencyPaths
>];

export function emergencyStepPathSequence(journeyId: string) {
  const paths = buildEmergencyPaths(journeyId);
  return [
    paths.riderPrompt,
    paths.riderMobile,
    paths.riderOtp,
    paths.riderName,
    paths.ridersSummary,
    paths.contactsEmpty,
    paths.contactMobile,
    paths.contactOtp,
    paths.contactName,
    paths.contactsSummary,
  ] as const;
}

export { ROUTE_NAMESPACE };
