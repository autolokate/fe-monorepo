import { expect, test, type Page } from '@playwright/test';

import { DQ_SAFETY_ALERTS, DQ_USER_CRASH } from './helpers/drivequant-fixtures';
import {
  HERMETIC_CUSTOMER_ACCOUNT_ID,
  installHermeticApiRoutes,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';
import { installDriveQuantRoutes } from './helpers/hermetic-drivequant';
import { installHermeticSosRoutes, SOS_CALLING_ID, SOS_SAFE_ID } from './helpers/hermetic-sos';
import { installUsersV4Routes } from './helpers/hermetic-users-v4';

/** Coordinates in the DriveQuant doc samples — must never reach the browser console. */
const PII_MARKERS = ['48.86', '48.85', '43.677', '41.91', 'sharedtrip.drivequant.com'];

function watchConsole(page: Page): string[] {
  const lines: string[] = [];
  page.on('console', (message) => {
    lines.push(message.text());
  });
  return lines;
}

/** Operator-facing text never names the telematics provider. */
async function expectNoProviderBranding(page: Page): Promise<void> {
  await expect(page.locator('body')).not.toContainText(/DriveQuant|DriveKit|\bDQ\b/);
}

function expectNoPii(lines: string[]): void {
  for (const line of lines) {
    for (const marker of PII_MARKERS) expect(line).not.toContain(marker);
  }
}

async function openDrivingTab(page: Page): Promise<void> {
  await openUsersPage(page);
  await page.getByText(HERMETIC_CUSTOMER_ACCOUNT_ID.slice(0, 8), { exact: true }).first().click();
  await expect(page.getByTestId('users-roles-panel')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('tab', { name: 'Driving' }).click();
  await expect(page).toHaveURL(/tab=driving/);
  await expect(page.getByTestId('user-driving-tab')).toBeVisible();
}

test.describe('Driving Activity telemetry (hermetic)', () => {
  test('user Driving tab: trips → trip drawer with grouped metrics + events; crashes', async ({
    page,
  }) => {
    const consoleLines = watchConsole(page);
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installUsersV4Routes(page);
    const dq = await installDriveQuantRoutes(page, { incidentId: SOS_CALLING_ID });
    await seedHermeticSession(page);
    await openDrivingTab(page);

    // Audited reads load only on request.
    expect(dq.tripDetail).toEqual([]);
    expect(dq.crashes).toEqual([]);

    await page.getByTestId('user-trips-load').click();
    const trips = page.getByTestId('user-trips');
    await expect(trips).toContainText('18.4 km', { timeout: 10_000 });
    await expect(trips).toContainText('Verified');
    await expect(page.getByTestId('driving-overview')).toContainText('Entitled');
    await trips.getByText('18.4 km').click();

    const drawer = page.getByTestId('dq-trip-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('Verified');
    await expect(drawer).toContainText('Car (1)', { timeout: 10_000 });
    await expect(drawer).toContainText('Driver (passenger 12%)');
    await expect(drawer).toContainText('Pont de Puteaux');
    // Detailed metrics are a drill-down, closed by default.
    await expect(page.getByTestId('dq-group-safety')).toBeHidden();
    await page.getByTestId('dq-trip-advanced').locator('summary').click();
    for (const group of [
      'safety',
      'eco',
      'fuel',
      'distraction',
      'speeding',
      'wear',
      'trip',
      'device',
    ]) {
      await expect(page.getByTestId(`dq-group-${group}`)).toBeVisible();
    }
    await expect(page.getByTestId('dq-metric-pollutants')).toContainText('43.45 mg/km');
    await expect(page.getByTestId('dq-metric-advancedSafety')).toContainText('Traffic jam');
    await expect(page.getByTestId('dq-metric-speedingStatistics')).toContainText('Limit (km/h)');
    await expect(page.getByTestId('dq-advice')).toContainText('sfty-urban-day-dry-D030-brk-v01');

    const events = page.getByTestId('dq-events');
    await expect(events).toContainText('Harsh braking');
    await expect(events).toContainText('Call started');
    await expect(events).toContainText('Forbidden call');
    await expect(events.getByTestId('dq-event-map').first()).toHaveAttribute(
      'href',
      /google\.com\/maps\/search\/\?api=1&query=48\.8/,
    );
    await page.getByTestId('dq-event-filter-STOP').click();
    await expect(events.locator('li')).toHaveCount(1);
    await expect(events).toContainText('Vehicle stop');
    await expect(drawer).toContainText('route not shown to admins');
    await expect(drawer).toContainText('IST');
    await expectNoProviderBranding(page);
    expect(dq.tripDetail).toHaveLength(1);

    await page.getByRole('button', { name: 'Close panel' }).click();
    await expect(drawer).toHaveCount(0);

    await page.getByTestId('user-crashes-load').click();
    const crashes = page.getByTestId('user-crashes');
    await expect(crashes).toContainText('Confirmed crash', { timeout: 10_000 });
    await expect(crashes).toContainText('Escalated to SOS');
    await expect(crashes).toContainText('78%');
    await expect(crashes).toContainText('23 km/h');
    await expect(crashes).toContainText('Matched to the trip');
    // FAILED_TO_PREDICT → "Needs review", not escalated; consent / plan gaps flagged.
    await expect(crashes).toContainText('Needs review');
    await expect(crashes).toContainText('Not escalated — review');
    await expect(crashes).toContainText('No consent');
    await expect(crashes).toContainText('Not entitled');
    await page.getByRole('button', { name: 'Needs review' }).click();
    await expect(crashes.locator('tbody tr')).toHaveCount(1);
    await expect(crashes).not.toContainText('Confirmed crash');
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expectNoProviderBranding(page);
    await expect(crashes.getByRole('link', { name: 'SOS incident' })).toHaveAttribute(
      'href',
      `/sos/${SOS_CALLING_ID}`,
    );
    expect(dq.crashes).toEqual(['?limit=50']);

    await page.getByTestId('dq-crash-open-trip').click();
    await expect(page.getByTestId('dq-trip-drawer')).toContainText(DQ_USER_CRASH.dqTripId ?? '', {
      timeout: 10_000,
    });
    await expect(page.getByTestId('dq-trip-advanced')).toBeVisible();
    expect(dq.tripDetail.at(-1)).toContain(encodeURIComponent(DQ_USER_CRASH.dqTripId ?? ''));
    expect(base.unexpected).toEqual([]);
    expectNoPii(consoleLines);
  });

  test('phone-reported trip without telemetry says so', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installUsersV4Routes(page);
    await installDriveQuantRoutes(page, { trip: 'empty', crashes: 'empty' });
    await seedHermeticSession(page);
    await openDrivingTab(page);
    await page.getByTestId('user-trips-load').click();
    await page.getByTestId('user-trips').getByText('18.4 km').click();
    await expect(page.getByTestId('dq-trip-no-telemetry')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Close panel' }).click();
    await page.getByTestId('user-crashes-load').click();
    await expect(page.getByTestId('user-crashes')).toContainText('No crash events', {
      timeout: 10_000,
    });
  });

  test('403 step-up on the trip detail re-opens the step-up prompt', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installUsersV4Routes(page);
    await installDriveQuantRoutes(page, { trip: 'step_up' });
    await seedHermeticSession(page);
    await openDrivingTab(page);
    await page.getByTestId('user-trips-load').click();
    await page.getByTestId('user-trips').getByText('18.4 km').click();
    await expect(page.getByTestId('admin-step-up')).toBeVisible({ timeout: 15_000 });
  });

  test('SOS crash incident: crash telemetry panel with location, GPS + IMU charts, report', async ({
    page,
  }) => {
    const consoleLines = watchConsole(page);
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const sos = await installHermeticSosRoutes(page);
    const dq = await installDriveQuantRoutes(page);
    await seedHermeticSession(page);

    await page.goto(`/sos/${SOS_CALLING_ID}`);
    const panel = page.getByTestId('sos-crash-telemetry');
    await expect(panel).toContainText('Confirmed crash', { timeout: 30_000 });
    await expect(panel).toContainText('Escalated to SOS');
    await expect(panel).toContainText('Consent granted');
    await expect(panel).toContainText('78%');
    await expect(panel).toContainText('23 km/h');
    await expect(page.getByTestId('dq-crash-coords')).toContainText('43.677391, 1.532724');
    // Advanced telemetry is a drill-down only.
    await expect(page.getByTestId('dq-crash-investigation')).toHaveCount(0);
    await expect(page.getByTestId('dq-gps-track')).toHaveCount(0);
    await expect(page.getByTestId('dq-crash-map')).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=43.677391,1.532724',
    );
    await expect(page.getByTestId('dq-crash-live-url')).toHaveAttribute(
      'href',
      'https://sharedtrip.drivequant.com/v1/CQD5hLox7',
    );
    await expectNoProviderBranding(page);
    await page.getByTestId('dq-crash-investigate').click();
    await expect(page.getByTestId('dq-gps-track')).toBeVisible();
    await expect(page.getByTestId('dq-chart-velocity')).toBeVisible();
    await expect(page.getByTestId('dq-chart-velocity').getByTestId('dq-chart-impact')).toHaveCount(
      1,
    );
    await expect(page.getByTestId('dq-imu-charts').locator('figure')).toHaveCount(3);
    await expect(page.getByTestId('dq-chart-accelerationX')).toContainText('Acceleration X');
    await expect(page.getByTestId('dq-crash-report')).toContainText('Aggressive Driving: High');
    await expect(page.getByTestId('dq-crash-report')).toContainText('15.54 km');
    await expect(page.getByTestId('dq-crash-user-driving')).toHaveAttribute(
      'href',
      /\/users\?account=acc-crash&tab=driving/,
    );

    // The incident detail keeps polling; the audited telemetry read happens once.
    const reads = sos.detailReads;
    await expect.poll(() => sos.detailReads, { timeout: 15_000 }).toBeGreaterThan(reads);
    expect(dq.sosCrashTelemetry).toHaveLength(1);
    expect(base.unexpected).toEqual([]);
    expectNoPii(consoleLines);
  });

  test('SOS crash telemetry: empty, unavailable and non-crash incidents', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page);
    const dq = await installDriveQuantRoutes(page, { sos: 'empty' });
    await seedHermeticSession(page);

    await page.goto(`/sos/${SOS_CALLING_ID}`);
    await expect(page.getByTestId('sos-crash-telemetry-empty')).toBeVisible({ timeout: 30_000 });

    // A plain SOS (not a crash) never asks for crash telemetry.
    await page.goto(`/sos/${SOS_SAFE_ID}`);
    await expect(page.getByTestId('sos-hero')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sos-crash-telemetry')).toHaveCount(0);
    expect(dq.sosCrashTelemetry).toHaveLength(1);
    expect(dq.sosCrashTelemetry[0]).toContain(SOS_CALLING_ID);
  });

  test('SOS crash telemetry route absent → "not available" state', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page);
    await installDriveQuantRoutes(page, { sos: 'not_deployed' });
    await seedHermeticSession(page);
    await page.goto(`/sos/${SOS_CALLING_ID}`);
    await expect(page.getByTestId('sos-crash-telemetry-unavailable')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('SOS console: safety alerts list, labels and acknowledge', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page);
    const dq = await installDriveQuantRoutes(page);
    await seedHermeticSession(page);
    await page.goto('/sos');
    const panel = page.getByTestId('safety-alerts');
    await expect(panel.getByTestId('safety-alert')).toHaveCount(2, { timeout: 30_000 });
    await expect(panel).toContainText('Crash needs review');
    await expect(panel).toContainText('Probability: 41%');
    await expect(panel).toContainText('Vehicle guessed');
    await expect(panel).toContainText('Best guess — first linked vehicle');
    await expect(panel).toContainText('IST');
    await panel.getByTestId('safety-alert-ack').first().click();
    await expect(panel.getByTestId('safety-alert')).toHaveCount(1, { timeout: 10_000 });
    expect(dq.acknowledged).toEqual([DQ_SAFETY_ALERTS[0]?.id]);
    await page.getByRole('button', { name: 'All alerts' }).click();
    await expect(panel).toContainText('Acknowledged', { timeout: 10_000 });
    await expectNoProviderBranding(page);
    expect(base.unexpected).toEqual([]);
  });

  test('SOS console: safety alerts empty and unavailable states', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page);
    await installDriveQuantRoutes(page, { alerts: 'empty' });
    await seedHermeticSession(page);
    await page.goto('/sos');
    await expect(page.getByTestId('safety-alerts-empty')).toBeVisible({ timeout: 30_000 });
  });

  test('SOS console: safety alerts route absent → unavailable', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page);
    await installDriveQuantRoutes(page, { alerts: 'not_deployed' });
    await seedHermeticSession(page);
    await page.goto('/sos');
    await expect(page.getByTestId('safety-alerts-unavailable')).toBeVisible({ timeout: 30_000 });
  });
});
