import { test, expect } from '@playwright/test';

test.describe('Hamburger Button Visual QA & Animation Verification', () => {
  test('Capture Hamburger Morph States in Dark and Light Modes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Landing Page Dark Mode - Closed
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity/brain/85261ed8-df70-4385-9bb3-f171c67a0ece/qa-hamburger-dark-closed.png' });

    // 2. Open Navigation Drawer
    const drawerBtnDark = page.getByRole('button', { name: 'Open navigation drawer' });
    await expect(drawerBtnDark).toBeVisible();
    await drawerBtnDark.click();
    await page.waitForTimeout(600); // allow 380ms drawer slide & 450ms morph to finish
    await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity/brain/85261ed8-df70-4385-9bb3-f171c67a0ece/qa-hamburger-dark-opened.png' });

    // 3. Toggle to Light Mode via Drawer Footer
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' }).first();
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity/brain/85261ed8-df70-4385-9bb3-f171c67a0ece/qa-hamburger-light-opened.png' });

    // 4. Close Drawer in Light Mode
    const closeBtnLight = page.getByRole('button', { name: 'Close navigation menu' }).first();
    await expect(closeBtnLight).toBeVisible();
    await closeBtnLight.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'C:/Users/ADMIN/.gemini/antigravity/brain/85261ed8-df70-4385-9bb3-f171c67a0ece/qa-hamburger-light-closed.png' });
  });
});
