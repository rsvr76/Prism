import { test } from '@playwright/test';

test('Check matched CSS rules on mc-button', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const ruleInfo = await page.evaluate(() => {
    const btn = document.querySelector('header .mc-button');
    if (!btn) return null;
    btn.classList.add('active');
    const activeTransform = window.getComputedStyle(btn).transform;
    
    btn.classList.remove('active');
    const removedTransform = window.getComputedStyle(btn).transform;

    // Check all CSS rules in document.styleSheets for .mc-button
    const matchedRules = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          const styleRule = rule as CSSStyleRule;
          if (styleRule.selectorText && styleRule.selectorText.includes('mc-button')) {
            matchedRules.push({
              selector: styleRule.selectorText,
              cssText: styleRule.cssText
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
