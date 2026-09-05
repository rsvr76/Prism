import { test } from '@playwright/test';

test('Check matched CSS rules on mc-button', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const ruleInfo = await page.evaluate(() => {
    const btn = document.querySelector('header .mc-button');
    btn.classList.add('active');
    const activeTransform = window.getComputedStyle(btn).transform;
    
    btn.classList.remove('active');
    const removedTransform = window.getComputedStyle(btn).transform;

    // Check all CSS rules in document.styleSheets for .mc-button
    const matchedRules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes('mc-button')) {
            matchedRules.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        }
      } catch (e) {}
    }

    return {
      activeTransform,
      removedTransform,
      matchedRules
    };
  });

  console.log('RULE INFO:', JSON.stringify(ruleInfo, null, 2));
});
