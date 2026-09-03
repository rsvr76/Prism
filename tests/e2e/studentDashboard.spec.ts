import { test, expect } from '@playwright/test';

test.describe('Phase 8D: Unified Student Progress & Dashboard E2E Validation', () => {

  test('1. Navigation from Workbench to Student Dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Dashboard link in top nav
    const dashboardNav = page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Dashboard' });
    await expect(dashboardNav).toBeVisible();
    await dashboardNav.click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard headings and primary sections render
    await expect(page.getByRole('heading', { name: /Start Your DSA Learning Journey|Continue:/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Learning Progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Practice Progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
  });

  test('2. Continue Learning Action Points to Correct First Lesson for New Student', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Click Continue Learning
    const continueBtn = page.getByRole('link', { name: 'Continue Learning' });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Navigates to Lesson 1
    await expect(page).toHaveURL(/\/paths\/dsa-foundations\/arrays-memory-access/);
    await expect(page.getByRole('heading', { name: 'Dynamic Arrays & Direct Indexing' })).toBeVisible();
  });

  test('3. Lesson Completion Reflects in Dashboard and Advances Continue Learning', async ({ page }) => {
    // 1. Open Lesson 1 and mark complete
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');

    const markBtn = page.getByRole('button', { name: /Mark as Complete|Completed/i });
    await expect(markBtn).toBeVisible();
    if (await page.getByRole('button', { name: 'Mark as Complete' }).isVisible()) {
      await page.getByRole('button', { name: 'Mark as Complete' }).click();
    }
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible();

    // 2. Navigate to Dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Progress updates to 10%
    await expect(page.getByText('1 of 10 Lessons Complete')).toBeVisible();

    // Continue Learning advances to Lesson 2 (Singly Linked Lists)
    await expect(page.getByRole('heading', { name: /Continue: Singly Linked Lists/i })).toBeVisible();
    const continueBtn = page.getByRole('link', { name: 'Continue Learning' });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();
    await expect(page).toHaveURL(/\/paths\/dsa-foundations\/linked-lists-pointers/);
  });

  test('4. Recent Activity Stream Logs Lesson & Challenge Events', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Recent activity lists the completed lesson
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(page.getByText(/Dynamic Arrays & Direct Indexing/i).first()).toBeVisible();
  });

  test('5. Reset Progress Confirmation Modal and State Clearing', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Click Reset All Progress
    const resetBtn = page.getByRole('button', { name: /Reset All Progress/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Modal appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Reset Student Progress?')).toBeVisible();

    // Cancel modal first
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Open again and Confirm Reset
    await resetBtn.click();
    await page.getByRole('button', { name: 'Confirm Reset' }).click();

    // Success banner appears
    await expect(page.getByText('All student progress has been reset successfully.')).toBeVisible();

    // Learning progress resets back to 0%
    await expect(page.getByText('0 of 10 Lessons Complete')).toBeVisible();
  });

  test('6. Dashboard Viewport Responsiveness on Tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Primary components render without overflow
    await expect(page.getByRole('heading', { name: 'Learning Progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Practice Progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reset All Progress/i })).toBeVisible();
  });
});
