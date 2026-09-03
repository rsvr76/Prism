import { test, expect } from '@playwright/test';

test.describe('Phase 8E: Complete Student Product Flows & Release Readiness', () => {

  test('Flow 1: Home → Learning Paths → Lesson → Try in Prism → Execute Trace', async ({ page }) => {
    // 1. Home / Workbench
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1')).toHaveText('PRISM');

    // 2. Navigate to Learning Paths
    const pathsLink = page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Learning Paths' });
    await pathsLink.click();
    await expect(page).toHaveURL(/\/paths/);

    // 3. Open DSA Foundations
    const startPathBtn = page.getByRole('link', { name: /Start Learning|Resume Path|Review Path/i });
    await startPathBtn.click();
    await expect(page).toHaveURL(/\/paths\/dsa-foundations/);

    // 4. Open Lesson 1
    const lessonLink = page.getByRole('link', { name: /Dynamic Arrays & Direct Indexing/i }).first();
    await lessonLink.click();
    await expect(page).toHaveURL(/\/paths\/dsa-foundations\/arrays-memory-access/);

    // 5. Try in Prism
    const tryBtn = page.getByRole('link', { name: 'Try in Prism' }).first();
    await tryBtn.click();
    await expect(page).toHaveURL(/\/\?algo=array&lesson=arrays-memory-access/);

    // 6. Execute in Workbench
    const runBtn = page.getByRole('button', { name: 'Run Trace' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });
  });

  test('Flow 2: Lesson → Practice Concept Cross-Link → Workbench Challenge Layout', async ({ page }) => {
    // 1. Open Lesson 1
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');

    // 2. Find Practice This Concept section
    await expect(page.getByText('Practice This Concept')).toBeVisible();
    const challengeLink = page.getByRole('link', { name: /Find the Maximum Value/i });
    await expect(challengeLink).toBeVisible();
    await challengeLink.click();

    // 3. Navigates to challenge page
    await expect(page).toHaveURL(/\/practice\/find-maximum-value/);
    await expect(page.getByRole('heading', { name: 'Find the Maximum Value' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Run & Submit/i })).toBeVisible();
  });

  test('Flow 3: Practice Progressive Hint Reveal', async ({ page }) => {
    await page.goto('/practice/find-maximum-value');
    await page.waitForLoadState('domcontentloaded');

    // Reveal Hint 1
    const revealBtn = page.getByRole('button', { name: /Reveal hint/i });
    await expect(revealBtn).toBeVisible();
    await revealBtn.click();
    await expect(page.getByText(/Hint 1:/i)).toBeVisible();

    // Reveal Hint 2
    if (await page.getByRole('button', { name: /Reveal hint 2/i }).isVisible()) {
      await page.getByRole('button', { name: /Reveal hint 2/i }).click();
      await expect(page.getByText(/Hint 2:/i)).toBeVisible();
    }
  });

  test('Flow 4: Progress Dashboard → Continue Learning to Next Lesson', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Click Continue Learning
    const continueBtn = page.getByRole('link', { name: 'Continue Learning' });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Navigates to the appropriate lesson
    await expect(page).toHaveURL(/\/paths\/dsa-foundations\//);
  });

  test('Flow 5: Complete Responsive Navigation Loop Across All 5 Core Destinations', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // 1. Workbench
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const mainNav = page.getByRole('navigation', { name: 'Main Navigation' });

    // 2. Algorithm Library
    await mainNav.getByRole('link', { name: /Library/i }).click();
    await expect(page).toHaveURL(/\/library/);
    await expect(page.getByRole('heading', { name: /Algorithm/i }).first()).toBeVisible();

    // 3. Learning Paths
    await page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: /Paths/i }).click();
    await expect(page).toHaveURL(/\/paths/);
    await expect(page.getByRole('heading', { name: 'Structured Learning Journeys' })).toBeVisible();

    // 4. Practice
    await page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Practice' }).click();
    await expect(page).toHaveURL(/\/practice/);
    await expect(page.getByRole('heading', { name: 'Practice Challenges' })).toBeVisible();

    // 5. Dashboard
    await page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Learning Progress' })).toBeVisible();

    // 6. Return to Workbench
    await page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Workbench' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toHaveText('PRISM');
  });
});
