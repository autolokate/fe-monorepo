import { expect, test } from '@playwright/test';

import { unsupportedSpecSkipReason } from './helpers/admin-oa-smoke-matrix';
import {
  HERMETIC_SUPPORT_TICKET_ID,
  HERMETIC_SUPPORT_TICKET_SUBJECT,
  installHermeticApiRoutes,
  openSupportTicketsPage,
  seedHermeticSession,
} from './helpers/hermetic';

const skipReason =
  unsupportedSpecSkipReason('support-tickets.hermetic.spec.ts') ??
  '/admin/v1/support/tickets* absent from live Dev OA';

/**
 * Live Dev OA: support tickets absent (Phase 11). Hermetic mock ≠ Live Supported.
 * Skipped ≠ passed.
 */
test.describe.skip(`Support ticket status (hermetic) — ${skipReason}`, () => {
  test('list OPEN → IN_PROGRESS — GET/PATCH wiring + toast', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openSupportTicketsPage(page);

    await expect(page.getByText(HERMETIC_SUPPORT_TICKET_SUBJECT)).toBeVisible({
      timeout: 10_000,
    });
    expect(capture.supportTicketsGet).toBeGreaterThanOrEqual(1);

    await page.getByTestId(`support-ticket-triage-${HERMETIC_SUPPORT_TICKET_ID}`).click();
    const dialog = page.getByRole('dialog', { name: 'Change ticket status' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(HERMETIC_SUPPORT_TICKET_SUBJECT);

    await dialog.getByTestId('support-ticket-status-select').selectOption('IN_PROGRESS');
    await dialog.getByTestId('support-ticket-status-submit').click();

    await expect(page.getByRole('status')).toContainText('Ticket set to IN_PROGRESS', {
      timeout: 10_000,
    });
    await expect(dialog).toBeHidden();

    expect(capture.supportTicketsPatch).toHaveLength(1);
    expect(capture.supportTicketsPatch[0]?.method).toBe('PATCH');
    expect(capture.supportTicketsPatch[0]?.path).toBe(
      `/admin/v1/support/tickets/${encodeURIComponent(HERMETIC_SUPPORT_TICKET_ID)}`,
    );
    expect(capture.supportTicketsPatch[0]?.body).toEqual({ status: 'IN_PROGRESS' });
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      supportTicketsPatchStatus: 403,
    });
    await seedHermeticSession(page);
    await openSupportTicketsPage(page);

    await page.getByTestId(`support-ticket-triage-${HERMETIC_SUPPORT_TICKET_ID}`).click();
    const dialog = page.getByRole('dialog', { name: 'Change ticket status' });
    await dialog.getByTestId('support-ticket-status-select').selectOption('RESOLVED');
    await dialog.getByTestId('support-ticket-status-submit').click();

    await expect(dialog.locator('.admin-form-error')).toHaveText(
      'Something went wrong. Try again.',
      { timeout: 10_000 },
    );
    expect(capture.supportTicketsPatch).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides Change status CTA', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await openSupportTicketsPage(page);

    await expect(page.getByText(HERMETIC_SUPPORT_TICKET_SUBJECT)).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByTestId(`support-ticket-triage-${HERMETIC_SUPPORT_TICKET_ID}`),
    ).toHaveCount(0);
    expect(capture.supportTicketsPatch).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on list surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      supportTicketsGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/support', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
