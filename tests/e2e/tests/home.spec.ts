import { test, expect } from '@playwright/test';

test.describe('home smoke', () => {
  test('loads the world map home screen', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/.+/);
    await expect(page.getByText('The Realm')).toBeVisible();
    await expect(page.getByText('Choose a region to explore')).toBeVisible();
  });
});
