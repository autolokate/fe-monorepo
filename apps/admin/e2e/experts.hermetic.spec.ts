import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

const EXPERT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee9001';
const BOOKING_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee9002';

/** ADM-11 — expert admin write routes (stubbed); results shown are the server's. */
test('experts — upsert profile shows server id; confirm booking surfaces 409 reason', async ({
  page,
}) => {
  await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  const puts: unknown[] = [];
  await page.route('**/admin/v1/experts', async (route) => {
    puts.push(route.request().postDataJSON() as unknown);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { id: EXPERT_ID, name: 'Hermetic Expert', designation: '', bio: '', expertise: [] },
      }),
    });
  });
  await page.route(`**/admin/v1/expert-bookings/${BOOKING_ID}/confirm`, async (route) => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 'expert_invalid_transition', message: 'Booking is not PENDING.' },
      }),
    });
  });
  await seedHermeticSession(page);
  await page.goto('/experts');

  await page.getByTestId('expert-name').fill('Hermetic Expert', { timeout: 30_000 });
  await page.getByTestId('expert-save').click();
  await expect(page.getByTestId('expert-result')).toContainText(EXPERT_ID);
  expect(puts[0]).toMatchObject({ name: 'Hermetic Expert', status: 'ACTIVE' });

  // The saved id puts the form in update mode: PUT replaces every column, so saving needs an
  // explicit confirmation and carries rating / sessions instead of silently resetting them.
  await expect(page.getByTestId('expert-replace-warning')).toBeVisible();
  await expect(page.getByTestId('expert-save')).toBeDisabled();
  await page.getByTestId('expert-rating').fill('4.8');
  await page.getByTestId('expert-sessions-completed').fill('120');
  await page.getByTestId('expert-replace-confirm').check({ force: true });
  await page.getByTestId('expert-save').click();
  await expect.poll(() => puts.length).toBe(2);
  expect(puts[1]).toMatchObject({ id: EXPERT_ID, rating: 4.8, sessionsCompleted: 120 });

  await page.getByTestId('expert-booking-id').fill(BOOKING_ID);
  await page.getByTestId('expert-booking-confirm').click();
  await expect(page.getByText('Booking is not PENDING.')).toBeVisible();
});
