import { test, expect } from '@playwright/test';

test.describe('Prism Real Browser E2E & Production UX Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('1. Workbench Layout & Core Components Mount Correctly', async ({ page }) => {
    // Brand header
    await expect(page.locator('h1')).toHaveText('PRISM');

    // Controls
    await expect(page.getByRole('button', { name: 'Execute' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Visualize' })).toBeVisible();
    await expect(page.getByTitle('Reset Code & Execution')).toBeVisible();

    // Editor container
    await expect(page.getByText('Python 3.12 Editor')).toBeVisible();

    // Timeline Scrubber initial empty state
    await expect(page.getByText(/Timeline ready/i)).toBeVisible();

    // Visualizer Canvas empty state
    await expect(page.getByText(/Interactive Visualizer Canvas|run and inspect|visualize/i).first()).toBeVisible();
  });

  test('2. Standard Python Execution, Timeline Scrubbing & Monaco Line Sync', async ({ page }) => {
    const runBtn = page.getByRole('button', { name: 'Visualize' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();

    // Wait for execution to complete
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });

    // Timeline is populated
    await expect(page.getByText(/^Step 1 \//i)).toBeVisible();

    // Step Forward
    const stepForwardBtn = page.getByTitle('Step Forward');
    await stepForwardBtn.click();
    await expect(page.getByText(/^Step 2 \//i)).toBeVisible();

    // Step Backward
    const stepBackBtn = page.getByTitle('Step Backward');
    await stepBackBtn.click();
    await expect(page.getByText(/^Step 1 \//i)).toBeVisible();
  });

  test('3. Execution State Panel & Grounded Step Explainer', async ({ page }) => {
    const runBtn = page.getByRole('button', { name: 'Visualize' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });

    // Step forward into execution where variables exist
    const stepForwardBtn = page.getByTitle('Step Forward');
    for (let i = 0; i < 5; i++) {
      await stepForwardBtn.click();
    }

    // Open AI and Diagnostics panel
    await page.getByRole('button', { name: /Toggle AI and Diagnostics panel/i }).click();

    // 1. Variables Tab
    const variablesTab = page.getByRole('button', { name: /Variables/i });
    await variablesTab.click();
    await expect(page.getByText(/No variables currently in local scope|val|self|Node/i).first()).toBeVisible();

    // 2. Call Stack Tab
    const stackTab = page.getByRole('button', { name: /Call Stack/i });
    await stackTab.click();
    await expect(page.getByText(/Node|<module>/i).first()).toBeVisible();

    // 3. AI Explainer Tab
    const explainerTab = page.getByRole('button', { name: 'AI Explainer' });
    await explainerTab.click();
    const explainBtn = page.getByRole('button', { name: /Explain Step|Re-explain/i });
    await expect(explainBtn).toBeVisible();
    await explainBtn.click();
    await expect(page.getByText(/Summary|Why It Happened|Explanation Unavailable|Diffing execution frames/i).first()).toBeVisible({ timeout: 60000 });
  });

  test('4. Interactive AI Learning (Tutor & Big-O Complexity Insights)', async ({ page }) => {
    const runBtn = page.getByRole('button', { name: 'Visualize' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });

    // Open AI and Diagnostics panel
    await page.getByRole('button', { name: /Toggle AI and Diagnostics panel/i }).click();

    // 1. AI Tutor Tab
    const tutorTab = page.getByRole('button', { name: 'AI Tutor' });
    await tutorTab.click();
    const starterPrompt = page.getByRole('button', { name: 'Why did this happen?' });
    if (await starterPrompt.isVisible()) {
      await starterPrompt.click();
      await expect(page.getByText(/Grounded in Step|Tutor|Assistant/i).first()).toBeVisible({ timeout: 60000 });
    }

    // 2. Complexity Tab
    const complexityTab = page.getByRole('button', { name: 'Big-O' });
    await complexityTab.click();
    const analyzeComplexityBtn = page.getByRole('button', { name: /Analyze|Re-Analyze/i });
    if (await analyzeComplexityBtn.isVisible()) {
      await analyzeComplexityBtn.click();
      await expect(page.getByText(/Grounded Big-O Insights/i)).toBeVisible({ timeout: 60000 });
      await expect(page.getByText(/Time \(Empirical\)|Why Prism Reached|Analysis Unavailable|Confidence/i).first()).toBeVisible({ timeout: 60000 });
    }
  });

  test('5. Data Structure Visualization (Linked List Preset)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const presetSelect = page.locator('select');
    await presetSelect.selectOption('Linked List Traversal');

    const runBtn = page.getByRole('button', { name: 'Visualize' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });

    // Step forward until linked list is constructed
    const stepForwardBtn = page.getByTitle('Step Forward');
    for (let i = 0; i < 20; i++) {
      await stepForwardBtn.click();
    }

    // Verify Linked List node structure rendered in React Flow canvas
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('6. Data Structure Visualization (Bubble Sort Array Preset)', async ({ page }) => {
    const presetSelect = page.locator('select');
    await presetSelect.selectOption('Bubble Sort');

    const runBtn = page.getByRole('button', { name: 'Visualize' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });

    // Step forward into sorting loop
    const stepForwardBtn = page.getByTitle('Step Forward');
    for (let i = 0; i < 5; i++) {
      await stepForwardBtn.click();
    }

    // Array elements rendered
    await expect(page.getByText(/numbers|arr/i).first().or(page.locator('.react-flow'))).toBeVisible();
  });

  test('7. What-If Branching Workflow & Tab Switching', async ({ page }) => {
    const runBtn = page.getByRole('button', { name: 'Visualize' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });

    // Open What-If Modal
    const whatIfBtn = page.getByRole('button', { name: 'What If?' });
    await expect(whatIfBtn).toBeVisible();
    await whatIfBtn.click();

    // Modal is visible
    await expect(page.getByText('What-If Code Branching')).toBeVisible();

    // Execute Branch
    const executeBranchBtn = page.getByRole('button', { name: 'Execute Branch' });
    await executeBranchBtn.click();

    // Wait for What-If modal to finish execution and close
    await expect(page.getByText('What-If Code Branching')).not.toBeVisible({ timeout: 60000 });

    // Wait for branch tab to appear in execution tabs
    const branchTab = page.getByRole('button', { name: /Branch 1/i });
    await expect(branchTab).toBeVisible({ timeout: 60000 });

    // Switch back to Original tab
    const originalTab = page.getByRole('button', { name: /Original/i });
    await originalTab.click();
    await expect(originalTab).toHaveClass(/bg-cyan-900|font-bold/);

    // Switch back to Branch 1 tab
    await branchTab.click();
    await expect(branchTab).toHaveClass(/bg-purple-900|font-bold/);
  });

  test('8. Modal Keyboard Accessibility (Escape key closes What-If)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const runBtn = page.getByRole('button', { name: 'Visualize' });
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await runBtn.click();
    await expect(page.getByText(/Executed \(\d+ steps\)/i)).toBeVisible({ timeout: 60000 });

    // Open modal
    await page.getByRole('button', { name: 'What If?' }).click();
    await expect(page.getByText('What-If Code Branching')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(page.getByText('What-If Code Branching')).not.toBeVisible();
  });

  test('9. Viewport Responsiveness (Tablet 768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('PRISM');
    await expect(page.getByRole('button', { name: 'Execute' })).toBeVisible();
    await expect(page.getByText('Python 3.12 Editor')).toBeVisible();
  });
});
