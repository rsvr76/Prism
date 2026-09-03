import { test, expect } from '@playwright/test';

test.describe('Phase 8C: Practice & Challenges E2E Validation', () => {

  test('1. Navigation from Workbench to Practice Catalog', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Practice tab in navigation drawer
    await page.getByRole('button', { name: 'Navigation menu' }).click();
    const practiceNav = page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Practice' });
    await expect(practiceNav).toBeVisible();
    await practiceNav.click();
    await expect(page).toHaveURL(/\/practice/);

    // Practice dashboard header and challenge cards render
    await expect(page.getByRole('heading', { name: 'Practice Challenges' })).toBeVisible();
    await expect(page.getByText('Test your DSA understanding with real Python execution.')).toBeVisible();
    await expect(page.getByText(/total challenges/i)).toBeVisible();
  });

  test('2. Practice Catalog Filters and Search Interaction', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('domcontentloaded');

    // Search input
    const searchInput = page.getByLabel('Search challenges');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('maximum');

    // Verify filtered card
    await expect(page.getByRole('heading', { name: 'Find the Maximum Value' })).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Filter by Topic dropdown
    const topicSelect = page.getByLabel('Filter by topic');
    await expect(topicSelect).toBeVisible();
    await topicSelect.selectOption('trees');
    await expect(page.getByRole('heading', { name: 'In-Order Tree Traversal' })).toBeVisible();
  });

  test('3. Challenge Workbench Experience: Code Challenge Layout & Hints', async ({ page }) => {
    await page.goto('/practice/find-maximum-value');
    await page.waitForLoadState('domcontentloaded');

    // Title & instructions render
    await expect(page.getByRole('heading', { name: 'Find the Maximum Value' }).first()).toBeVisible();
    await expect(page.getByText(/Complete.*find_max/i)).toBeVisible();

    // Progressive hint reveal
    const revealBtn = page.getByRole('button', { name: /Reveal hint/i });
    await expect(revealBtn).toBeVisible();
    await revealBtn.click();
    await expect(page.getByText(/Hint 1:/i)).toBeVisible();

    // Monaco editor container and submit button are present
    await expect(page.getByRole('button', { name: /Run and submit challenge|Run & Submit/i })).toBeVisible();
  });

  test('4. Trace-Prediction Challenge: Choice Selection & Guidance', async ({ page }) => {
    await page.goto('/practice/linear-search-trace-prediction');
    await page.waitForLoadState('domcontentloaded');

    // Trace question is displayed
    await expect(page.getByText('Your Prediction', { exact: true })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /How many times will the loop body execute/i })).toBeVisible();

    // Multiple choice options exist
    const optionBtn = page.getByRole('button', { name: '3', exact: true });
    await expect(optionBtn).toBeVisible();
    await optionBtn.click();
  });

  test('5. Lesson-to-Challenge Cross-Link Integration', async ({ page }) => {
    await page.goto('/paths/dsa-foundations/arrays-memory-access');
    await page.waitForLoadState('domcontentloaded');

    // 'Practice This Concept' section appears on the lesson page
    await expect(page.getByText('Practice This Concept')).toBeVisible();
    const practiceLink = page.getByRole('link', { name: /Find the Maximum Value/i });
    await expect(practiceLink).toBeVisible();
  });
});

