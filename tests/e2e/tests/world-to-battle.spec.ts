import { test, expect } from '@playwright/test';

test.describe('world → exploration → battle', () => {
  test('navigates from /play through prison map into battle', async ({ page }) => {
    await page.goto('/play');

    await expect(page.getByText('The Realm')).toBeVisible();
    await expect(page.getByText('Choose a region to explore')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Prison Fortress/ }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'ENTER REGION' }).click();

    await expect(page.getByRole('button', { name: 'BATTLE →' })).toBeVisible();
    await expect(page.getByRole('button', { name: '← THE REALM' })).toBeVisible();
    await expect(
      page.locator('span').filter({ hasText: /^HOLLOWFORT PRISON$/ }).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'BATTLE →' }).click();

    await expect(page.getByRole('button', { name: '← PRISON MAP' })).toBeVisible();
    await expect(
      page.locator('span').filter({ hasText: /^DARK\s*FANTASY\s*DUEL$/ }),
    ).toBeVisible();
    await expect(page.getByText(/YOUR TURN|TURN START/)).toBeVisible();
  });
});
