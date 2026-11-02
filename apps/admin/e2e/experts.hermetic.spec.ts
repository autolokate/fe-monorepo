import { expect, test, type Route } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

const EXPERT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee9001';
const INACTIVE_EXPERT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee9003';
const BOOKING_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee9002';
const META = { requestId: 'r', correlationId: 'c' };

/** OpenAPI `AdminExpertDto`. */
const STORED_EXPERT = {
  id: EXPERT_ID,
  name: 'Hermetic Expert',
  designation: 'Master technician',
  bio: 'Twenty years on Indian roads.',
  expertise: ['EV', 'Brakes'],
  channelUrl: 'https://example.test/channel',
  rating: 4.8,
  sessionsCompleted: 120,
  status: 'ACTIVE',
  photoAsset: 'expert_hermetic',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-20T00:00:00.000Z',
};

const INACTIVE_EXPERT = {
  ...STORED_EXPERT,
  id: INACTIVE_EXPERT_ID,
  name: 'Retired Expert',
  status: 'INACTIVE',
  rating: null,
  channelUrl: null,
  photoAsset: null,
  sessionsCompleted: 0,
};

async function fulfill(route: Route, status: number, data: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(status >= 400 ? data : { data, meta: META }),
  });
}

/** ADM-11 — expert admin list/read/write routes (stubbed); results shown are the server's. */
test('experts — list, open prefills the form, save writes every field; booking 409 reason', async ({
  page,
}) => {
  await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  const puts: unknown[] = [];
  const listQueries: string[] = [];
  await page.route('**/admin/v1/experts?**', async (route) => {
    const status = new URL(route.request().url()).searchParams.get('status');
    listQueries.push(status ?? '');
    await fulfill(
      route,
      200,
      status === 'INACTIVE'
        ? [INACTIVE_EXPERT]
        : status === 'ACTIVE'
          ? [STORED_EXPERT]
          : [STORED_EXPERT, INACTIVE_EXPERT],
    );
  });
  await page.route('**/admin/v1/experts', async (route) => {
    if (route.request().method() === 'GET') {
      listQueries.push('');
      await fulfill(route, 200, [STORED_EXPERT, INACTIVE_EXPERT]);
      return;
    }
    const body = route.request().postDataJSON() as Record<string, unknown>;
    puts.push(body);
    await fulfill(route, 200, {
      id: (body.id as string | undefined) ?? EXPERT_ID,
      name: body.name,
      designation: body.designation ?? '',
      bio: body.bio ?? '',
      expertise: body.expertise ?? [],
    });
  });
  await page.route(`**/admin/v1/experts/${EXPERT_ID}`, async (route) => {
    await fulfill(route, 200, STORED_EXPERT);
  });
  await page.route(`**/admin/v1/expert-bookings/${BOOKING_ID}/confirm`, async (route) => {
    await fulfill(route, 409, {
      error: { code: 'expert_invalid_transition', message: 'Booking is not PENDING.' },
    });
  });
  await seedHermeticSession(page);
  await page.goto('/experts');

  const list = page.getByRole('region', { name: 'Experts', exact: true });
  await expect(list).toContainText('Hermetic Expert', { timeout: 30_000 });
  await expect(list).toContainText('Retired Expert');
  await expect(list).toContainText('Inactive');

  await list.getByRole('button', { name: 'Inactive', exact: true }).click();
  await expect(list).not.toContainText('Hermetic Expert');
  expect(listQueries).toContain('INACTIVE');
  await list.getByRole('button', { name: 'All', exact: true }).click();

  // Opening a row reads GET /admin/v1/experts/{id} and prefills every field.
  await list.getByText('Hermetic Expert').click();
  await expect(page.getByTestId('expert-id')).toHaveValue(EXPERT_ID);
  await expect(page.getByTestId('expert-name')).toHaveValue('Hermetic Expert');
  await expect(page.getByTestId('expert-rating')).toHaveValue('4.8');
  await expect(page.getByTestId('expert-sessions-completed')).toHaveValue('120');
  await expect(page.getByTestId('expert-channel-url')).toHaveValue('https://example.test/channel');
  await expect(page.getByTestId('expert-photo-asset')).toHaveValue('expert_hermetic');
  // No re-enter-everything confirmation any more: a prefilled save is a normal save.
  await expect(page.getByTestId('expert-replace-warning')).toHaveCount(0);

  await page.getByTestId('expert-name').fill('Hermetic Expert Senior');
  await page.getByTestId('expert-save').click();
  await expect.poll(() => puts.length).toBe(1);
  expect(puts[0]).toEqual({
    id: EXPERT_ID,
    name: 'Hermetic Expert Senior',
    designation: 'Master technician',
    bio: 'Twenty years on Indian roads.',
    expertise: ['EV', 'Brakes'],
    channelUrl: 'https://example.test/channel',
    rating: 4.8,
    sessionsCompleted: 120,
    photoAsset: 'expert_hermetic',
    status: 'ACTIVE',
  });
  await expect(page.getByTestId('expert-result')).toContainText(EXPERT_ID);

  // New expert clears the form and creates without an id.
  await page.getByTestId('expert-new').click();
  await expect(page.getByTestId('expert-name')).toHaveValue('');
  await page.getByTestId('expert-name').fill('Brand New Expert');
  await page.getByTestId('expert-save').click();
  await expect.poll(() => puts.length).toBe(2);
  expect(puts[1]).toMatchObject({ name: 'Brand New Expert', status: 'ACTIVE' });
  expect(puts[1]).not.toHaveProperty('id');

  await page.getByTestId('expert-booking-id').fill(BOOKING_ID);
  await page.getByTestId('expert-booking-confirm').click();
  await expect(page.getByText('Booking is not PENDING.')).toBeVisible();
});
