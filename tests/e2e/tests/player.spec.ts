import { test, expect } from '@playwright/test';

test.describe('character page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('opens player experience and cards from the world map', async ({ page }) => {
    await page.goto('/play');

    await page.getByRole('button', { name: 'CHARACTER' }).click();

    await expect(page.getByText('HOLLOWFORT LEDGER')).toBeVisible();
    await expect(page.getByText('Unknown Prisoner')).toBeVisible();
    await expect(page.getByRole('button', { name: 'CHARACTER' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'QUESTS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'INVENTORY' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Fighter/ })).toBeVisible();
    await expect(page.getByText('Current Deck')).toBeVisible();
    await expect(page.getByRole('button', { name: '← World Map' })).toBeVisible();

    await page.getByRole('button', { name: 'INVENTORY' }).click();
    await expect(page.getByRole('button', { name: /Dried Lavender/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lowcap Mushroom/ })).toBeVisible();
  });
});
