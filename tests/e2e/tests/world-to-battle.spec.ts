import { test, expect } from '@playwright/test';

test.describe('world → exploration → battle', () => {
  test('navigates from /play through prison map into location battle', async ({ page }) => {
    await page.goto('/play');

    await expect(page.getByText('The Realm')).toBeVisible();
    await expect(page.getByRole('button', { name: /Prison Fortress/ })).toBeVisible();
    await page.getByRole('button', { name: 'ENTER REGION' }).click();

    await expect(page.getByRole('button', { name: '← THE REALM' })).toBeVisible();
    await page.getByRole('button', { name: 'ENTER THE PRISON' }).click();

    const continueDialog = page.getByRole('button', { name: /CONTINUE|CLOSE/ });
    for (let i = 0; i < 8; i += 1) {
      if (!(await continueDialog.isVisible().catch(() => false))) {
        break;
      }
      await continueDialog.click();
      await page.waitForTimeout(80);
    }

    await expect(page.getByText('QUEST LOG')).toBeVisible();
    await page.getByRole('button', { name: /Cell Block/ }).click();
    await expect(page.getByRole('button', { name: 'TRAVEL HERE' })).toBeVisible();

    await page.locator('text=CARDS IN HAND').locator('xpath=ancestor::div[contains(@class,"flex-1")]').locator('button').first().click();
    await page.getByRole('button', { name: 'TRAVEL HERE' }).click();

    await expect(page.getByRole('button', { name: 'FIGHT' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Prisoner').first()).toBeVisible();
    await page.getByRole('button', { name: 'FIGHT' }).click();

    await expect(page.getByRole('button', { name: '← PRISON MAP' })).toBeVisible();
    await expect(page.getByText(/YOUR TURN|TURN START/)).toBeVisible();
  });
});
