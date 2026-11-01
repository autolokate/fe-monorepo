import { expect, test } from '@playwright/test';

import {
  HERMETIC_SUPPORT_TICKET_ID,
  HERMETIC_SUPPORT_TICKET_SUBJECT,
  installHermeticApiRoutes,
  openSupportTicketsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic support tickets — stubbed /admin/v1/support/tickets* (be-integration contract).
 * Proves the FE wiring only; the dev API does not serve these routes yet.
 */
test.describe('Support tickets (hermetic)', () => {
  test('open ticket → privacy note for body → IN_PROGRESS with ops note', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
    await openSupportTicketsPage(page);

    await page.getByText(HERMETIC_SUPPORT_TICKET_SUBJECT).click({ timeout: 10_000 });
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByTestId('support-ticket-body-private')).toHaveText(
      'Customer message not visible to operators (privacy).',
    );
    await expect(dialog).toContainText('ALK-HERM-ST');

    await dialog.getByTestId('support-ticket-status-select').selectOption('IN_PROGRESS');
    await dialog.getByTestId('support-ticket-note').fill('Replacement sticker posted');
    await dialog.getByTestId('support-ticket-status-submit').click();

    // The sheet stays open (detail refetches); the success toast sits behind the modal.
    await expect.poll(() => capture.supportTicketsPatch.length).toBe(1);
    expect(capture.supportTicketsPatch[0]?.path).toBe(
      `/admin/v1/support/tickets/${encodeURIComponent(HERMETIC_SUPPORT_TICKET_ID)}`,
    );
    expect(capture.supportTicketsPatch[0]?.body).toEqual({
      status: 'IN_PROGRESS',
      note: 'Replacement sticker posted',
    });
  });

  test('409 support_ticket_invalid_transition is explained inline', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      supportTicketsPatchStatus: 409,
    });
    await seedHermeticSession(page);
    await openSupportTicketsPage(page);

    await page.getByText(HERMETIC_SUPPORT_TICKET_SUBJECT).click({ timeout: 10_000 });
    const dialog = page.getByRole('dialog');
    await dialog.getByTestId('support-ticket-status-select').selectOption('RESOLVED');
    await dialog.getByTestId('support-ticket-status-submit').click();
    await expect(dialog.getByTestId('support-ticket-status-error')).toContainText(
      'isn’t allowed from the ticket’s current status',
    );
  });

  test('permission — READ_ONLY (not OPERATOR) gets the access-denied gate, no admin calls', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await page.goto('/support');
    await expect(page.getByTestId('admin-access-denied')).toBeVisible({ timeout: 15_000 });
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on list surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      supportTicketsGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/support', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByText('The server refused this action for your operator session.'),
    ).toBeVisible({ timeout: 15_000 });
  });
});
