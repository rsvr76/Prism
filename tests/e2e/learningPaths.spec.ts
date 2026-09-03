import { test, expect } from '@playwright/test';

test.describe('Phase 8B: Guided Learning Paths & Progression E2E Validation', () => {

  test('1. Navigation from Workbench to Learning Paths Catalog & Path Overview', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Learning Paths link in top nav
    const pathsNav = page.getByRole('link', { name: 'Learning Paths' });
    await expect(pathsNav).toBeVisible();
    await pathsNav.click();
    await expect(page).toHaveURL(/\/paths/);

    // Learning Paths catalog renders
    await expect(page.getByRole('heading', { name: 'Structured Learning Journeys' })).toBeVisible();
    await expect(page.getByText('DSA Foundations')).toBeVisible();

    // Click into DSA Foundations path overview
    const startPathBtn = page.getByRole('link', { name: /Start Learning|Resume Path|Review Path/i });
    await expect(startPathBtn).toBeVisible();
    await startPathBtn.click();
    await expect(page).toHaveURL(/\/paths\/dsa-foundations/);

    // Curriculum overview renders stages and lessons
    await expect(page.getByRole('heading', { name: 'DSA Foundations' })).toBeVisible();
    await expect(page.getByText(/Stage 1: Contiguous Memory & Arrays/i)).toBeVisible();
    await expect(page.getByText(/Dynamic Arrays & Direct Indexing/i)).toBeVisible();
  });

  test('2. Lesson Experience: Pedagogical Sections & Concept Displays', async ({ page }) => {
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');

    // Breadcrumb navigation
    await expect(page.getByLabel('Breadcrumbs').getByRole('link', { name: 'Learning Paths' })).toBeVisible();
    await expect(page.getByLabel('Breadcrumbs').getByRole('link', { name: 'DSA Foundations' })).toBeVisible();

    // Lesson Title & Subtitle
    await expect(page.getByRole('heading', { name: 'Dynamic Arrays & Direct Indexing' })).toBeVisible();

    // Pedagogical Sections
    await expect(page.getByText('Why Am I Learning This?')).toBeVisible();
    await expect(page.getByText('Learning Objectives')).toBeVisible();
    await expect(page.getByText('Prerequisites')).toBeVisible();
    await expect(page.getByText('Concept & Mental Model')).toBeVisible();
    await expect(page.getByText(/Intuitive Mental Model:/i)).toBeVisible();

    // Workbench Example Preview
    await expect(page.getByText(/Workbench Example: Array/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Try in Prism' }).first()).toBeVisible();

    // What to Watch & Ask AI Tutor
    await expect(page.getByText('What to Watch in Prism')).toBeVisible();
    await expect(page.getByText('Ask the AI Tutor in Workbench')).toBeVisible();
  });

  test('3. Lesson Completion Toggle & Local Progression Persistence Across Reload', async ({ page }) => {
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');

    // Initially Mark as Complete button is present
    const completeBtn = page.getByRole('button', { name: /Mark as Complete|Completed/i });
    await expect(completeBtn).toBeVisible();

    // Click to mark complete
    if (await page.getByRole('button', { name: 'Mark as Complete' }).isVisible()) {
      await page.getByRole('button', { name: 'Mark as Complete' }).click();
    }
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible();

    // Reload page to verify persistence via client storage
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Should remain Completed after reload
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible();

    // Navigate to Path overview to verify progress calculation
    await page.goto('/paths/dsa-foundations');
    await page.waitForLoadState('domcontentloaded');

    // Progress counter shows at least 1 lesson completed
    await expect(page.getByText(/1 of 10 Lessons Completed \(10%\)/i)).toBeVisible();
  });

  test('4. Sequential Lesson Traversal via Next & Previous Navigation', async ({ page }) => {
    // Start at Lesson 1
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');

    // Click Next Lesson
    const nextBtn = page.getByRole('link', { name: /Next: Singly Linked Lists/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to Lesson 2
    await expect(page).toHaveURL(/\/paths\/dsa-foundations\/linked-lists-pointers/);
    await expect(page.getByRole('heading', { name: 'Singly Linked Lists & Node Chaining' })).toBeVisible();

    // Click Previous Lesson
    const prevBtn = page.getByRole('link', { name: /Previous: Dynamic Arrays/i });
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    // Navigates back to Lesson 1
    await expect(page).toHaveURL(/\/paths\/dsa-foundations\/arrays-memory-access/);
    await expect(page.getByRole('heading', { name: 'Dynamic Arrays & Direct Indexing' })).toBeVisible();
  });

  test('5. Try in Prism Launches into Workbench and Executes Real Python Trace', async ({ page }) => {
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');

    // Click Try in Prism
    const tryBtn = page.getByRole('link', { name: 'Try in Prism' }).first();
    await expect(tryBtn).toBeVisible();
    await tryBtn.click();

    // Navigates to workbench with algo and lesson query parameters
    await expect(page).toHaveURL(/\/\?algo=array&lesson=arrays-memory-access/);

    // Header displays guided lesson context badge
    await expect(page.getByTitle('Return to Guided Lesson')).toBeVisible();

    // Editor is mounted with Python code
    await expect(page.getByText('Python 3.12 Editor')).toBeVisible();

    // Execute via standard Run Trace button
    const runBtn = page.getByRole('button', { name: 'Run Trace' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();

    // Real execution succeeds
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });
  });

  test('6. Viewport Responsiveness on Tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // 1. Path overview on tablet
    await page.goto('/paths/dsa-foundations');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'DSA Foundations' })).toBeVisible();
    await expect(page.getByText(/Stage 1: Contiguous Memory/i)).toBeVisible();

    // 2. Lesson view on tablet
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'Dynamic Arrays & Direct Indexing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Try in Prism' }).first()).toBeVisible();
  });
});
