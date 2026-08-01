import { test, expect } from '@playwright/test';

test.describe('world → exploration → battle', () => {
  test('navigates from /play through prison map into location battle', async ({ page }) => {
    await page.goto('/play');

    await expect(page.getByText('The Realm')).toBeVisible();
    await expect(page.getByText('Choose a region to explore')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Prison Fortress/ }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'ENTER REGION' }).click();

    await expect(page.getByRole('button', { name: '← THE REALM' })).toBeVisible();
    await expect(
      page.locator('span').filter({ hasText: /^HOLLOWFORT PRISON$/ }).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'ENTER THE PRISON' }).click();

    const continueDialog = page.getByRole('button', { name: /CONTINUE|CLOSE/ });
    while (await continueDialog.isVisible().catch(() => false)) {
      await continueDialog.click();
      await page.waitForTimeout(100);
    }

    await expect(page.getByRole('button', { name: 'FIGHT' })).toBeVisible();
    await expect(page.getByText('Undead Prisoner').first()).toBeVisible();
    await page.getByRole('button', { name: 'FIGHT' }).click();

    await expect(page.getByRole('button', { name: '← PRISON MAP' })).toBeVisible();
    await expect(
      page.locator('span').filter({ hasText: /^DARK\s*FANTASY\s*DUEL$/ }),
    ).toBeVisible();
    await expect(page.getByText('Undead Prisoner').first()).toBeVisible();
    await expect(page.getByText(/YOUR TURN|TURN START/)).toBeVisible();
  });
});
