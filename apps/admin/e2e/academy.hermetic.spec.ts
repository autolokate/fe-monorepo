import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  HERMETIC_ACADEMY_COURSE_ID,
  HERMETIC_ACADEMY_DRAFT_LESSON_ID,
  HERMETIC_ACADEMY_NEW_COURSE_ID,
  HERMETIC_ACADEMY_OTHER_CHANNEL_YOUTUBE,
  installHermeticAcademyRoutes,
  openAcademyPage,
} from './helpers/hermetic-academy';

/**
 * `/admin/v1/academy/*` lands with migration 0089. Hermetics mock HTTP — they do not prove the
 * live oEmbed channel check or the consumer entitlement gate.
 */
test.describe('Admin Academy (hermetic)', () => {
  test('creates a course, refuses an empty publish, publishes after a lesson', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const academy = await installHermeticAcademyRoutes(page);
    await seedHermeticSession(page);
    await openAcademyPage(page);

    await expect(page.getByText('Hermetic driving basics')).toBeVisible();
    await expect(page.getByText('0 of 1 published')).toBeVisible();

    await page.getByRole('button', { name: 'New course' }).click();
    const courseDialog = page.getByRole('dialog', { name: 'New Academy course' });
    await courseDialog.getByTestId('academy-course-title').fill('Hermetic safety essentials');
    await courseDialog.getByTestId('academy-course-level').selectOption('intermediate');
    await courseDialog.getByTestId('academy-course-submit').click();
    await expect(page.getByText('Created "Hermetic safety essentials" as a draft.')).toBeVisible();
    expect(academy.courseCreates[0]?.body).toEqual({
      title: 'Hermetic safety essentials',
      level: 'intermediate',
      language: 'en',
      featured: false,
      sortOrder: 0,
    });
    await expect(page.getByTestId('academy-lessons-heading')).toContainText(
      'Hermetic safety essentials',
    );

    await page.getByTestId(`academy-course-publish-${HERMETIC_ACADEMY_NEW_COURSE_ID}`).click();
    await expect(
      page.getByText('Publish at least one lesson before publishing the course.'),
    ).toBeVisible();

    await page.getByTestId(`academy-course-lessons-${HERMETIC_ACADEMY_COURSE_ID}`).click();
    await expect(page.getByText('Hermetic lesson one')).toBeVisible();
    await page.getByTestId(`academy-lesson-publish-${HERMETIC_ACADEMY_DRAFT_LESSON_ID}`).click();
    await expect
      .poll(() => academy.transitions.map((t) => t.path))
      .toContain(`/admin/v1/academy/lessons/${HERMETIC_ACADEMY_DRAFT_LESSON_ID}/publish`);
    await expect(page.getByText('1 of 1 published')).toBeVisible();

    await page.getByTestId(`academy-course-publish-${HERMETIC_ACADEMY_COURSE_ID}`).click();
    await expect
      .poll(() => academy.transitions.map((t) => t.path))
      .toContain(`/admin/v1/academy/courses/${HERMETIC_ACADEMY_COURSE_ID}/publish`);

    expect(base.unexpected).toEqual([]);
    expect(academy.unexpected).toEqual([]);
  });

  test('adds a lesson with takeaways and shows the channel error inline', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    const academy = await installHermeticAcademyRoutes(page);
    await seedHermeticSession(page);
    await openAcademyPage(page);

    await page.getByTestId(`academy-course-lessons-${HERMETIC_ACADEMY_COURSE_ID}`).click();
    await page.getByTestId('academy-lesson-add').click();
    const dialog = page.getByRole('dialog', { name: 'Add lesson' });
    await dialog.getByTestId('academy-lesson-youtube').fill(HERMETIC_ACADEMY_OTHER_CHANNEL_YOUTUBE);
    await dialog.getByTestId('academy-lesson-submit').click();
    await expect(dialog.getByTestId('academy-lesson-submit-error')).toContainText(
      'not from an approved channel',
    );

    await dialog.getByTestId('academy-lesson-youtube').fill('https://youtu.be/hermeticCC3');
    await dialog.getByTestId('academy-lesson-takeaways').fill('Check mirrors\n\nSignal early');
    await dialog.getByTestId('academy-lesson-publish').check({ force: true });
    await dialog.getByTestId('academy-lesson-submit').click();
    await expect(page.getByText('Added and published "Hermetic YouTube title".')).toBeVisible();
    expect(academy.lessonCreates[1]?.body).toEqual({
      youtube: 'https://youtu.be/hermeticCC3',
      takeaways: ['Check mirrors', 'Signal early'],
      sortOrder: 0,
      publish: true,
    });
  });
});
