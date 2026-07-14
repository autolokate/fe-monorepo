import {
  buildPurchasePaths,
  parseJourneyIdFromPathname,
} from '../routing/journey-url-routing';

import { legacyPurchasePathRedirects, purchaseJourneyPathsFor } from './purchase-routing';

function readJourneyIdFromUrl(): string {
  if (typeof window === 'undefined') {
    return '_';
  }
  return parseJourneyIdFromPathname(window.location.pathname) ?? '_';
}

/** Journey-scoped purchase paths derived from the current URL (not localStorage). */
export function getActivePurchasePaths() {
  return purchaseJourneyPathsFor(readJourneyIdFromUrl());
}

/** Reads journey id from URL at access time — not localStorage. */
export const purchaseJourneyPaths = new Proxy({} as ReturnType<typeof purchaseJourneyPathsFor>, {
  get(_target, prop: string) {
    const paths = getActivePurchasePaths();
    return paths[prop as keyof typeof paths];
  },
});

export function purchaseVehicleLookupPath(
  journeyIdOrRegistration: string,
  registration?: string,
): string {
  if (registration !== undefined) {
    return buildPurchasePaths(journeyIdOrRegistration).vehicleLookup(registration);
  }
  const journeyId = readJourneyIdFromUrl();
  return buildPurchasePaths(journeyId).vehicleLookup(journeyIdOrRegistration);
}

export function purchaseVehicleConfirmationPath(
  journeyIdOrRegistration: string,
  registration?: string,
): string {
  if (registration !== undefined) {
    return buildPurchasePaths(journeyIdOrRegistration).vehicleConfirmation(registration);
  }
  const journeyId = readJourneyIdFromUrl();
  return buildPurchasePaths(journeyId).vehicleConfirmation(journeyIdOrRegistration);
}

export function legacyPurchasePathRedirectsForActiveJourney() {
  return legacyPurchasePathRedirects(readJourneyIdFromUrl());
}

export { readJourneyIdFromUrl };
