import { test, expect } from '@playwright/test';

test.describe('world → exploration → battle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('navigates from /play through prison map into location battle', async ({ page }) => {
    await page.goto('/play?seed=4242');

    await expect(page.getByText('The Realm')).toBeVisible();
    await expect(page.getByRole('button', { name: /Prison Fortress/ })).toBeVisible();
    await page.getByRole('button', { name: 'ENTER REGION' }).click();

    await expect(page.getByText('QUEST LOG')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('SEED 4242', { exact: true })).toBeVisible();

    const continueDialog = page.getByRole('button', { name: /CONTINUE|CLOSE/ });
    for (let i = 0; i < 8; i += 1) {
      if (!(await continueDialog.isVisible().catch(() => false))) {
        break;
      }
      await continueDialog.click();
      await page.waitForTimeout(80);
    }

    await page.getByRole('button', { name: /Cell Block/ }).click();
    await expect(page.getByRole('button', { name: 'TRAVEL HERE' })).toBeVisible();

    const hand = page.getByText('CARDS IN HAND').locator('xpath=ancestor::div[contains(@class,"flex-1")]');
    await hand.getByRole('button').first().click();
    await page.getByRole('button', { name: 'TRAVEL HERE' }).click();

    const fight = page.getByRole('button', { name: 'FIGHT', exact: true });
    await expect(fight.last()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Prisoner').first()).toBeVisible();
    await fight.last().click();

    await expect(page.getByText(/YOUR TURN|TURN START/)).toBeVisible({ timeout: 15000 });
  });
});
