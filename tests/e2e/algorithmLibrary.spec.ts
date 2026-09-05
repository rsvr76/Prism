import { test, expect } from '@playwright/test';

test.describe('Phase 8A: Algorithm Library & Learning Content E2E Validation', () => {

  test('1. Navigation from Workbench to Algorithm Library', async ({ page }) => {
    await page.goto('/workbench');
    await page.waitForLoadState('domcontentloaded');

    // Brand and navigation links exist
    await expect(page.locator('h1')).toHaveText('PRISM');
    await page.getByRole('button', { name: 'Navigation menu' }).click();
    const libraryNav = page.getByRole('link', { name: 'Algorithm Library' });
    await expect(libraryNav).toBeVisible();

    // Click navigation to Library
    await libraryNav.click();
    await expect(page).toHaveURL(/\/library/);

    // Library page header and hero mount correctly
    await expect(page.getByText('Algorithm & Data Structure Library')).toBeVisible();
    await expect(page.getByPlaceholder(/Search by topic/i)).toBeVisible();
  });

  test('2. Library Search and Category Filtering', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');

    // Verify initial topic count
    await expect(page.getByText(/Showing 10 of 10 topics/i)).toBeVisible();

    // Search for Bubble Sort
    const searchInput = page.getByPlaceholder(/Search by topic/i);
    await searchInput.fill('Bubble');
    await expect(page.getByText(/Showing 1 of 10 topics/i)).toBeVisible();
    await expect(page.getByText('Bubble Sort')).toBeVisible();
    await expect(page.getByText('Linear Search')).not.toBeVisible();

    // Clear search
    await searchInput.clear();
    await expect(page.getByText(/Showing 10 of 10 topics/i)).toBeVisible();

    // Filter by Data Structures category
    const structuresTab = page.getByRole('button', { name: /Structures/i });
    await structuresTab.click();
    await expect(page.getByText(/Showing 4 of 10 topics/i)).toBeVisible();
    await expect(page.getByText('Singly Linked List')).toBeVisible();
    await expect(page.getByText('Binary Search Tree (BST)')).toBeVisible();
    await expect(page.getByText('Bubble Sort')).not.toBeVisible();

    // Filter by Algorithms category
    const algorithmsTab = page.getByRole('button', { name: /Algorithms/i });
    await algorithmsTab.click();
    await expect(page.getByText(/Showing 6 of 10 topics/i)).toBeVisible();
    await expect(page.getByText('Bubble Sort')).toBeVisible();
    await expect(page.getByText('Binary Search')).toBeVisible();
  });

  test('3. Algorithm Detail View Concept & Implementation Display', async ({ page }) => {
    await page.goto('/library/binary-search');
    await page.waitForLoadState('domcontentloaded');

    // Breadcrumb navigation
    await expect(page.getByRole('link', { name: 'Library', exact: true })).toBeVisible();

    // Title and badges
    await expect(page.getByRole('heading', { name: 'Binary Search' })).toBeVisible();
    await expect(page.getByText(/1D Array Visualizer/i)).toBeVisible();

    // Pedagogical sections
    await expect(page.getByText('What This Does')).toBeVisible();
    await expect(page.getByText('How It Works')).toBeVisible();
    await expect(page.getByText('Complexity Analysis')).toBeVisible();
    await expect(page.getByText(/O\(log n\)/i).first()).toBeVisible();
    await expect(page.getByText('What to Watch in Prism')).toBeVisible();
    await expect(page.getByText('Ask Prism AI Tutor')).toBeVisible();

    // Python code preview
    await expect(page.getByText('Python 3 Implementation')).toBeVisible();
    await expect(page.getByText('def binary_search(arr, target):')).toBeVisible();
  });

  test('4. Try in Prism Launches into Workbench and Loads Algorithm Code', async ({ page }) => {
    await page.goto('/library/bubble-sort');
    await page.waitForLoadState('domcontentloaded');

    // Click Try in Prism
    const tryBtn = page.getByRole('button', { name: 'Try in Prism' }).first();
    await expect(tryBtn).toBeVisible();
    await tryBtn.click();

    // Navigates to workbench
    await expect(page).toHaveURL(/\/(workbench\?algo=bubble-sort|\?algo=bubble-sort)/);

    // Workbench displays loaded algorithm title badge
    await expect(page.getByText(/Bubble Sort/i).first()).toBeVisible();

    // Monaco editor container is present
    await expect(page.getByText('Python 3.12 Editor')).toBeVisible();

    // Execute the loaded code via the existing execution engine
    const runBtn = page.getByRole('button', { name: /Execute|Visualize/i }).first();
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();

    // Execution succeeds with real trace
    await expect(page.getByText(/Executed \(\d+ steps\)/i).or(page.getByText(/\d+ steps/i)).first()).toBeVisible({ timeout: 60000 });
  });

  test('5. Direct Try in Prism from Library Catalog Cards', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');

    // Filter to find Singly Linked List
    const searchInput = page.getByPlaceholder(/Search by topic/i);
    await searchInput.fill('Linked List');

    // Click Try in Prism directly on card
    const cardTryBtn = page.getByRole('button', { name: 'Try in Prism' }).first();
    await cardTryBtn.click();

    // Navigates to workbench with linked-list param
    await expect(page).toHaveURL(/\/(workbench\?algo=linked-list|\?algo=linked-list)/);
    await expect(page.getByText(/Singly Linked List/i).first()).toBeVisible();
  });

  test('6. Viewport Responsiveness on Tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // 1. Library catalog view
    await page.goto('/library');
    await expect(page.locator('h1')).toHaveText('PRISM');
    await expect(page.getByText('Algorithm & Data Structure Library')).toBeVisible();
    await expect(page.getByPlaceholder(/Search by topic/i)).toBeVisible();

    // 2. Algorithm detail view
    await page.goto('/library/binary-tree');
    await expect(page.getByRole('heading', { name: 'Binary Tree' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try in Prism' }).first()).toBeVisible();
  });
});
