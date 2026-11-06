import type { Page, Route } from '@playwright/test';

import { DQ_CRASH_TELEMETRY, DQ_TRIP_DETAIL, DQ_USER_CRASH } from './drivequant-fixtures';
import { HERMETIC_VEHICLE_ID } from './hermetic';
import { V4_TRIP } from './hermetic-users-v4';

const META = { requestId: 'hermetic-req', correlationId: 'hermetic-corr' };

export type DriveQuantMode = 'ok' | 'empty' | 'step_up' | 'not_deployed';

export type DriveQuantCapture = {
  tripDetail: string[];
  crashes: string[];
  sosCrashTelemetry: string[];
};

async function json(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: { 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  });
}

async function fail(route: Route, mode: DriveQuantMode, path: string): Promise<boolean> {
  if (mode === 'step_up') {
    await json(route, 403, {
      error: { code: 'step_up_required', message: 'Step-up (2FA) required for the admin plane.' },
    });
    return true;
  }
  if (mode === 'not_deployed') {
    await json(route, 404, { error: { code: 'not_found', message: `Cannot GET ${path}` } });
    return true;
  }
  return false;
}

/**
 * DriveQuant admin reads (trip detail, crashes, SOS crash telemetry) answered with the backend's
 * parsed doc samples. Registered after the base / users-v4 / SOS stubs → matched first; every other
 * request falls through to them.
 */
export async function installDriveQuantRoutes(
  page: Page,
  options: {
    trip?: DriveQuantMode;
    crashes?: DriveQuantMode;
    sos?: DriveQuantMode;
    incidentId?: string;
  } = {},
): Promise<DriveQuantCapture> {
  const capture: DriveQuantCapture = { tripDetail: [], crashes: [], sosCrashTelemetry: [] };

  await page.route(
    (url) => /^\/admin\/v1\/users\/[^/]+\/trips\/[^/]+$/.test(url.pathname),
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      capture.tripDetail.push(path);
      if (await fail(route, options.trip ?? 'ok', path)) return;
      const tripId = decodeURIComponent(path.split('/').at(-1) ?? '');
      // The list row (users-v4 stub) opens with its own id; a crash link opens the sample's itinId.
      const data =
        tripId === V4_TRIP.tripId
          ? {
              ...DQ_TRIP_DETAIL,
              ...V4_TRIP,
              source: undefined,
              telemetry: DQ_TRIP_DETAIL.telemetry,
            }
          : tripId === DQ_TRIP_DETAIL.tripId || tripId === DQ_USER_CRASH.dqTripId
            ? { ...DQ_TRIP_DETAIL, tripId, vehicleId: HERMETIC_VEHICLE_ID }
            : null;
      if (!data || options.trip === 'empty') {
        await json(route, 200, {
          data: { ...V4_TRIP, tripId, source: undefined, telemetry: null },
          meta: META,
        });
        return;
      }
      await json(route, 200, { data, meta: META });
    },
  );

  await page.route(
    (url) => /^\/admin\/v1\/users\/[^/]+\/crashes$/.test(url.pathname),
    async (route) => {
      const url = new URL(route.request().url());
      capture.crashes.push(url.search);
      if (await fail(route, options.crashes ?? 'ok', url.pathname)) return;
      const rows =
        options.crashes === 'empty'
          ? []
          : [
              {
                ...DQ_USER_CRASH,
                incidentId: options.incidentId ?? null,
                vehicleId: HERMETIC_VEHICLE_ID,
              },
            ];
      await json(route, 200, { data: rows, meta: META });
    },
  );

  await page.route(
    (url) => /^\/admin\/v1\/sos-incidents\/[^/]+\/crash-telemetry$/.test(url.pathname),
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      capture.sosCrashTelemetry.push(path);
      if (await fail(route, options.sos ?? 'ok', path)) return;
      await json(route, 200, {
        data: options.sos === 'empty' ? [] : [DQ_CRASH_TELEMETRY],
        meta: META,
      });
    },
  );

  return capture;
}
