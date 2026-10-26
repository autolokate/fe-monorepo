import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_MEDIA_POSTER_ID,
  HERMETIC_MEDIA_VIDEO_ID,
  HERMETIC_QA_HIDDEN_ID,
  HERMETIC_QA_ID,
  HERMETIC_REEL_DRAFT_ID,
  HERMETIC_REEL_ID,
  installHermeticDiscoveryRoutes,
  openDiscoveryOverviewPage,
  openDiscoveryQaPage,
  openDiscoveryReelsPage,
} from './helpers/hermetic-discovery';

const MP4_BYTES = Buffer.from('hermetic-mp4-bytes');
const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/**
 * `/admin/v1/community/{questions,reels}*` are on live Dev OA. Hermetics mock HTTP — they do not
 * prove Live OPERATOR/step_up.
 */
test.describe('Admin Discovery (hermetic)', () => {
  test('overview — counts from list endpoints + module links', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const discovery = await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await openDiscoveryOverviewPage(page);

    await expect(page.getByTestId('discovery-overview-qa')).toContainText('2');
    await expect(page.getByTestId('discovery-overview-reels')).toContainText('2');
    await expect(page.getByTestId('discovery-overview-engagement')).toContainText('340');
    await expect(page.getByTestId('discovery-overview-catalog')).toBeVisible();
    await expect(page.getByTestId('discovery-overview-subscriptions')).toBeVisible();

    await page.getByTestId('discovery-overview-qa').click();
    await expect(page).toHaveURL(/\/discovery\/qa$/);
    expect(base.unexpected).toEqual([]);
    expect(discovery.unexpected).toEqual([]);
  });

  test('Q&A — create draft sends HIDDEN, publish + hide send PATCH status', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const discovery = await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await openDiscoveryQaPage(page);

    await expect(page.getByText('Hermetic published question')).toBeVisible();
    await expect(page.getByText('Hermetic hidden question')).toBeVisible();

    await page.getByRole('button', { name: 'New Q&A' }).click();
    const dialog = page.getByRole('dialog', { name: 'New Q&A' });
    await dialog.getByTestId('discovery-qa-title').fill('Hermetic created question');
    await dialog.getByTestId('discovery-qa-body').fill('Created body');
    await dialog.getByTestId('discovery-qa-submit').click();

    await expect(page.getByRole('status')).toContainText(
      'Saved "Hermetic created question" as a hidden draft.',
    );
    expect(discovery.questionsCreate).toHaveLength(1);
    expect(discovery.questionsCreate[0]?.body).toEqual({
      kind: 'general',
      category: 'maintenance',
      title: 'Hermetic created question',
      body: 'Created body',
      status: 'HIDDEN',
    });

    await page.getByTestId(`discovery-qa-toggle-${HERMETIC_QA_HIDDEN_ID}`).click();
    await expect.poll(() => discovery.questionsPatch.length).toBe(1);
    expect(discovery.questionsPatch[0]?.path).toBe(
      `/admin/v1/community/questions/${HERMETIC_QA_HIDDEN_ID}`,
    );
    expect(discovery.questionsPatch[0]?.body).toEqual({ status: 'VISIBLE' });

    await page.getByTestId(`discovery-qa-toggle-${HERMETIC_QA_ID}`).click();
    await expect.poll(() => discovery.questionsPatch.length).toBe(2);
    expect(discovery.questionsPatch[1]?.body).toEqual({ status: 'HIDDEN' });

    expect(base.unexpected).toEqual([]);
    expect(discovery.unexpected).toEqual([]);
  });

  test('Q&A — edit sends only changed fields', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const discovery = await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await openDiscoveryQaPage(page);

    await page.getByTestId(`discovery-qa-open-${HERMETIC_QA_ID}`).click();
    const dialog = page.getByRole('dialog', { name: 'Edit Q&A' });
    await expect(dialog.getByTestId('discovery-qa-submit')).toBeDisabled();
    await dialog.getByTestId('discovery-qa-title').fill('Hermetic retitled question');
    await dialog.getByTestId('discovery-qa-submit').click();

    await expect.poll(() => discovery.questionsPatch.length).toBe(1);
    expect(discovery.questionsPatch[0]?.body).toEqual({ title: 'Hermetic retitled question' });
  });

  test('Q&A — search + status filter reach the server', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const discovery = await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await openDiscoveryQaPage(page);

    await page.getByRole('button', { name: 'Hidden' }).click();
    await expect(page.getByText('Hermetic published question')).toHaveCount(0);
    await page.getByRole('searchbox', { name: 'Search Q&A' }).fill('hidden');
    await expect
      .poll(() => discovery.questionsGet.some((call) => call.query.includes('q=hidden')))
      .toBe(true);
    expect(discovery.questionsGet.some((call) => call.query.includes('status=HIDDEN'))).toBe(true);
  });

  test('Reels — list shows metrics, create uploads via DISCOVERY_REEL pipeline then POSTs', async ({
    page,
  }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const discovery = await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await openDiscoveryReelsPage(page);

    const publishedRow = page.getByRole('row', { name: /Hermetic published reel/ });
    await expect(publishedRow).toContainText('340');
    await expect(page.getByTestId(`reel-thumb-${HERMETIC_REEL_ID}`)).toBeVisible();

    await page.getByRole('button', { name: 'New reel' }).click();
    const dialog = page.getByRole('dialog', { name: 'New reel' });
    await dialog.getByTestId('discovery-reel-stable-key').fill('hermetic-reel-new');
    await dialog.getByTestId('discovery-reel-title').fill('Hermetic new reel');
    await dialog.getByTestId('discovery-reel-video-file').setInputFiles({
      name: 'reel.mp4',
      mimeType: 'video/mp4',
      buffer: MP4_BYTES,
    });
    await dialog.getByTestId('discovery-reel-poster-file').setInputFiles({
      name: 'poster.png',
      mimeType: 'image/png',
      buffer: PNG_BYTES,
    });
    await dialog.getByTestId('discovery-reel-submit').click();

    await expect(page.getByRole('status')).toContainText('Created "Hermetic new reel" as a draft.');
    expect(discovery.mediaRequests.map((call) => call.body)).toEqual([
      { kind: 'DISCOVERY_REEL', contentType: 'video/mp4', sizeBytes: MP4_BYTES.length },
      { kind: 'DISCOVERY_REEL', contentType: 'image/png', sizeBytes: PNG_BYTES.length },
    ]);
    expect(discovery.mediaPuts).toHaveLength(2);
    expect(discovery.mediaCompletes).toEqual([HERMETIC_MEDIA_VIDEO_ID, HERMETIC_MEDIA_POSTER_ID]);
    expect(discovery.reelsCreate[0]?.body).toEqual({
      stableKey: 'hermetic-reel-new',
      title: 'Hermetic new reel',
      videoMediaId: HERMETIC_MEDIA_VIDEO_ID,
      thumbMediaId: HERMETIC_MEDIA_POSTER_ID,
      sortOrder: 0,
      publish: false,
    });
    expect(base.unexpected).toEqual([]);
    expect(discovery.unexpected).toEqual([]);
  });

  test('Reels — publish, unpublish (confirm) and archive (confirm) hit transition endpoints', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const discovery = await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await openDiscoveryReelsPage(page);

    await page.getByTestId(`discovery-reel-publish-${HERMETIC_REEL_DRAFT_ID}`).click();
    await expect.poll(() => discovery.reelTransitions.length).toBe(1);
    expect(discovery.reelTransitions[0]?.path).toBe(
      `/admin/v1/community/reels/${HERMETIC_REEL_DRAFT_ID}/publish`,
    );

    await page.getByTestId(`discovery-reel-unpublish-${HERMETIC_REEL_ID}`).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Unpublish' }).click();
    await expect.poll(() => discovery.reelTransitions.length).toBe(2);
    expect(discovery.reelTransitions[1]?.path).toBe(
      `/admin/v1/community/reels/${HERMETIC_REEL_ID}/unpublish`,
    );

    await page.getByTestId(`discovery-reel-open-${HERMETIC_REEL_ID}`).click();
    await page.getByTestId('discovery-reel-sheet-archive').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Archive' }).click();
    await expect.poll(() => discovery.reelTransitions.length).toBe(3);
    expect(discovery.reelTransitions[2]?.path).toBe(
      `/admin/v1/community/reels/${HERMETIC_REEL_ID}/archive`,
    );
  });

  test('Reels — edit sheet previews signed video and shows engagement', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await openDiscoveryReelsPage(page);

    await page.getByTestId(`discovery-reel-open-${HERMETIC_REEL_ID}`).click();
    await expect(page.getByTestId('discovery-reel-preview-video')).toBeVisible();
    await expect(page.getByTestId('discovery-reel-metrics')).toContainText('340');
    await expect(page.getByTestId('discovery-reel-metrics')).toContainText('12');
  });

  test('error — 404 from list surfaces "not available on this environment"', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticDiscoveryRoutes(page, { listStatus: 404 });
    await seedHermeticSession(page);
    await page.goto('/discovery/qa', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/not available on this environment yet/)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('permission — READ_ONLY is denied and makes no Discovery calls', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    const discovery = await installHermeticDiscoveryRoutes(page);
    await seedHermeticSession(page);
    await page.goto('/discovery/qa', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Access denied')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'New Q&A' })).toHaveCount(0);
    expect(discovery.questionsGet).toEqual([]);
    expect(discovery.questionsCreate).toEqual([]);
  });
});
