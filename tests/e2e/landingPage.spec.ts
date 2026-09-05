import { test, expect } from '@playwright/test';

test.describe('Landing & Opening Page E2E Validation', () => {

  test('1. Landing Page Mounts with Hero, Brand Logo, Typewriter, and TrustBar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Brand logo image is visible
    const logo = page.locator('img[alt*="Prism"]').first();
    await expect(logo).toBeVisible();

    // Shimmer badge
    await expect(page.getByText('Execution-Grounded DSA Learning')).toBeVisible();

    // Primary CTA buttons in Hero
    const startBtn = page.getByRole('link', { name: /Start Learning Free/i }).first();
    await expect(startBtn).toBeVisible();

    const demoBtn = page.getByRole('link', { name: /Try Quick Demo/i });
    await expect(demoBtn).toBeVisible();

    // TrustBar items
    await expect(page.getByText('Built with:')).toBeVisible();
    await expect(page.getByText('Python 3.12')).toBeVisible();
    await expect(page.getByText('WebAssembly')).toBeVisible();
  });

  test('2. Sorting Bars Animation & Live Trace Step Card', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Live trace step card is visible
    await expect(page.getByText(/live trace/i)).toBeVisible();
    await expect(page.getByText(/Step \d+ of \d+/i).first()).toBeVisible();
    await expect(page.getByText(/Prism explains: bubble pass/i)).toBeVisible();
  });

  test('3. Interactive Teaser: Algorithm Switch & Demo Stepping', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Scroll to teaser
    const teaser = page.locator('#teaser');
    await expect(teaser).toBeVisible();

    // Algorithm select dropdown
    const select = teaser.locator('select');
    await expect(select).toHaveValue('bubble');

    // Switch to Binary Search
    await select.selectOption('binary');
    await expect(page.getByText('def binary_search(arr, target):')).toBeVisible();

    // Click Run Demo
    const runBtn = teaser.getByRole('button', { name: /Run Demo/i });
    await runBtn.click();

    // Wait for step progression inside teaser
    await page.waitForTimeout(1000);
    await expect(teaser.getByText(/step \d+ of \d+/i)).toBeVisible();
  });

  test('4. Navbar Open Editor CTA Navigates to Workbench', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const openEditorBtn = page.getByRole('link', { name: /Open Editor/i }).first();
    await expect(openEditorBtn).toBeVisible();
    await openEditorBtn.click();

    // Navigates cleanly to /workbench
    await expect(page).toHaveURL(/\/workbench/);
    await expect(page.getByText('Python 3.12 Editor')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Execute' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Visualize' })).toBeVisible();
  });

  test('5. Hero Start Learning Free CTA Navigates to Workbench', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const startBtn = page.getByRole('link', { name: /Start Learning Free/i }).first();
    await startBtn.click();

    await expect(page).toHaveURL(/\/workbench/);
    await expect(page.getByText('Python 3.12 Editor')).toBeVisible();
  });

  test('6. Backward-Compatible Deep-Link Redirect (/?algo=bubble-sort -> /workbench?algo=bubble-sort)', async ({ page }) => {
    await page.goto('/?algo=bubble-sort');
    await page.waitForLoadState('domcontentloaded');

    // Automatically forwards to /workbench with preserved query params
    await expect(page).toHaveURL(/\/workbench\?algo=bubble-sort/);
    await expect(page.getByText(/Bubble Sort/i).first()).toBeVisible();
    await expect(page.getByText('Python 3.12 Editor')).toBeVisible();
  });

  test('7. Navigation Drawer Opens from Landing Page Navbar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click drawer button in navbar
    const drawerBtn = page.getByRole('button', { name: 'Open navigation drawer' });
    await expect(drawerBtn).toBeVisible();
    await drawerBtn.click();

    // Drawer is opened
    const drawer = page.getByRole('navigation', { name: 'Main Navigation' });
    await expect(drawer).toBeVisible();

    // Contains Home and Workbench links
    await expect(drawer.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Workbench' })).toBeVisible();

    // Click Workbench link in drawer
    await drawer.getByRole('link', { name: 'Workbench' }).click();
    await expect(page).toHaveURL(/\/workbench/);
  });

  test('8. Theme Toggle on Landing Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open navigation drawer (exclusive home of ThemeToggle)
    const drawerBtn = page.getByRole('button', { name: 'Open navigation drawer' });
    await drawerBtn.click();

    const themeBtn = page.getByRole('button', { name: 'Toggle theme' }).first();
    await expect(themeBtn).toBeVisible();

    // Initial state is dark
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Toggle to light mode
    await themeBtn.click();
    await expect(html).toHaveClass(/light/);

    // Toggle back to dark mode
    await themeBtn.click();
    await expect(html).toHaveClass(/dark/);
  });
});
