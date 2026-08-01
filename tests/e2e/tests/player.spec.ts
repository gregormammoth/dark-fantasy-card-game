import { test, expect } from '@playwright/test';

test.describe('character page', () => {
  test('opens player experience and cards from the world map', async ({ page }) => {
    await page.goto('/play');

    await page.getByRole('button', { name: 'CHARACTER' }).click();

    await expect(page.getByText('CHARACTER', { exact: true })).toBeVisible();
    await expect(page.getByText('Unknown Prisoner')).toBeVisible();
    await expect(page.getByText(/CLASS PROGRESSION/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Fighter/ })).toBeVisible();
    await expect(page.getByText('Current Deck')).toBeVisible();
    await expect(page.getByRole('button', { name: '← World Map' })).toBeVisible();
  });
});
