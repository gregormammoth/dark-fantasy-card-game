import { test, expect } from '@playwright/test';

test.describe('marketing home', () => {
  test('loads the public landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Hollowfort/i);
    await expect(page.getByRole('heading', { name: /hollowfort/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PLAY NOW' }).first()).toBeVisible();
    await expect(page.getByText('Four Classes. One Deck.')).toBeVisible();
  });
});
