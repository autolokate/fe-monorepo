import { expect, test } from '@playwright/test';

import {
  HERMETIC_BREAK_GLASS_APPROVAL_ID,
  HERMETIC_INCIDENT_ID,
  installHermeticApiRoutes,
  openIncidentsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic break-glass dual-control + incident list wiring.
 * Does NOT prove Live TTL / OPERATOR / step_up.
 */
test.describe('Break-glass incidents (hermetic)', () => {
  test('request → approve → load incidents — POST/GET wiring', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openIncidentsPage(page);

    await expect(page.getByTestId('break-glass-dual-control')).toBeVisible();
    await page.getByTestId('break-glass-justification').fill('Need list for QA dual-control');
    await page.getByTestId('break-glass-request').click();

    await expect(page.getByTestId('break-glass-latest')).toContainText(
      HERMETIC_BREAK_GLASS_APPROVAL_ID,
      { timeout: 10_000 },
    );
    await expect(page.getByTestId('break-glass-latest')).toContainText('PENDING');
    expect(capture.breakGlassRequest).toHaveLength(1);
    expect(capture.breakGlassRequest[0]?.body).toMatchObject({
      scopeKind: 'INCIDENT_LIST',
      justification: 'Need list for QA dual-control',
    });

    await page.getByTestId('break-glass-peer-id').fill(HERMETIC_BREAK_GLASS_APPROVAL_ID);
    await page.getByTestId('break-glass-approve').click();
    await expect(page.getByTestId('break-glass-latest')).toContainText('APPROVED', {
      timeout: 10_000,
    });
    expect(capture.breakGlassApprove).toEqual([HERMETIC_BREAK_GLASS_APPROVAL_ID]);

    await page.getByTestId('break-glass-load-incidents').click();
    // Table shows short uuid prefix + status badge / source label.
    await expect(page.getByText('aaaaaaaa')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/SOS/i)).toBeVisible();
    expect(capture.incidentsGet).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('TTL unconfigured — request surfaces error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      breakGlassRequestStatus: 503,
    });
    await seedHermeticSession(page);
    await openIncidentsPage(page);

    await page.getByTestId('break-glass-justification').fill('Need list for TTL check');
    await page.getByTestId('break-glass-request').click();
    await expect(page.getByTestId('break-glass-error')).toBeVisible({ timeout: 10_000 });
    expect(capture.breakGlassRequest).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('INCIDENT_DETAIL request → approve → load detail', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openIncidentsPage(page);

    await page.getByTestId('break-glass-justification').fill('Need detail for one incident');
    await page.getByTestId('break-glass-detail-incident-id').fill(HERMETIC_INCIDENT_ID);
    await page.getByTestId('break-glass-request-detail').click();

    await expect(page.getByTestId('break-glass-latest')).toContainText('INCIDENT_DETAIL', {
      timeout: 10_000,
    });
    expect(capture.breakGlassRequest.at(-1)?.body).toMatchObject({
      scopeKind: 'INCIDENT_DETAIL',
      incidentId: HERMETIC_INCIDENT_ID,
    });

    await page.getByTestId('break-glass-peer-id').fill(HERMETIC_BREAK_GLASS_APPROVAL_ID);
    await page.getByTestId('break-glass-approve').click();
    await expect(page.getByTestId('break-glass-latest')).toContainText('APPROVED', {
      timeout: 10_000,
    });

    await page.getByTestId('break-glass-load-detail').click();
    await expect(page.getByTestId('incident-detail-panel')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('incident-detail-id')).toHaveText(HERMETIC_INCIDENT_ID);
    await expect(page.getByTestId('incident-detail-status')).toHaveText('OPEN');
    await expect(page.getByTestId('incident-detail-alerts')).toHaveText('1');
    expect(capture.incidentsDetailGet).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('list row Prefill → INCIDENT_DETAIL → detail panel', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openIncidentsPage(page);

    await page.getByTestId('break-glass-justification').fill('Need list then row detail');
    await page.getByTestId('break-glass-request').click();
    await expect(page.getByTestId('break-glass-latest')).toContainText(
      HERMETIC_BREAK_GLASS_APPROVAL_ID,
      { timeout: 10_000 },
    );
    await page.getByTestId('break-glass-peer-id').fill(HERMETIC_BREAK_GLASS_APPROVAL_ID);
    await page.getByTestId('break-glass-approve').click();
    await expect(page.getByTestId('break-glass-latest')).toContainText('APPROVED', {
      timeout: 10_000,
    });
    await page.getByTestId('break-glass-load-incidents').click();
    await expect(page.getByText('aaaaaaaa')).toBeVisible({ timeout: 10_000 });

    // Prefill overrides any prior typed id and enables detail grant.
    await page.getByTestId('break-glass-detail-incident-id').fill('stale-typed-id');
    await page.getByTestId(`incident-detail-grant-${HERMETIC_INCIDENT_ID}`).click();
    await expect(page.getByTestId('break-glass-detail-incident-id')).toHaveValue(
      HERMETIC_INCIDENT_ID,
    );

    await page.getByTestId('break-glass-justification').fill('Need detail from list row');
    await page.getByTestId('break-glass-request-detail').click();
    await expect(page.getByTestId('break-glass-latest')).toContainText('INCIDENT_DETAIL', {
      timeout: 10_000,
    });
    expect(capture.breakGlassRequest.at(-1)?.body).toMatchObject({
      scopeKind: 'INCIDENT_DETAIL',
      incidentId: HERMETIC_INCIDENT_ID,
    });

    await page.getByTestId('break-glass-peer-id').fill(HERMETIC_BREAK_GLASS_APPROVAL_ID);
    await page.getByTestId('break-glass-approve').click();
    await expect(page.getByTestId('break-glass-latest')).toContainText('APPROVED', {
      timeout: 10_000,
    });
    await page.getByTestId('break-glass-load-detail').click();
    await expect(page.getByTestId('incident-detail-panel')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('incident-detail-id')).toHaveText(HERMETIC_INCIDENT_ID);
    expect(capture.incidentsDetailGet).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });
});
