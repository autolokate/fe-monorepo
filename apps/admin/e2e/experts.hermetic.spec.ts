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

  await page.getByTestId('expert-booking-id').fill(BOOKING_ID);
  await page.getByTestId('expert-booking-confirm').click();
  await expect(page.getByText('Booking is not PENDING.')).toBeVisible();
});
