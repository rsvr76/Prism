import { test, expect } from '@playwright/test';

test('Inspect Hamburger Button in DOM', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const btnInfo = await page.evaluate(() => {
    const btn = document.querySelector('header .mc-button');
    if (!btn) return { error: 'btn not found' };
    const rect = btn.getBoundingClientRect();
    const bars = Array.from(btn.querySelectorAll('b')).map((b, i) => {
      const bRect = b.getBoundingClientRect();
      const style = window.getComputedStyle(b);
      return {
        index: i + 1,
        top: style.top,
        marginTop: style.marginTop,
        height: style.height,
        width: style.width,
        opacity: style.opacity,
        display: style.display,
        visibility: style.visibility,
        bg: style.backgroundColor,
        bRect: { top: bRect.top, left: bRect.left, width: bRect.width, height: bRect.height }
      };
    });
    return {
      btnRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      bars
    };
  });

  console.log('BTN INFO ON LOAD:', JSON.stringify(btnInfo, null, 2));

  // Open drawer
  await page.getByRole('button', { name: 'Open navigation drawer' }).click();
  await page.waitForTimeout(600);

  // Close drawer
  await page.getByRole('button', { name: 'Close navigation menu' }).first().click();
  await page.waitForTimeout(800);

  const btnInfoAfterClose = await page.evaluate(() => {
    const btn = document.querySelector('header .mc-button');
    if (!btn) return { error: 'btn not found' };
    const rect = btn.getBoundingClientRect();
    const bars = Array.from(btn.querySelectorAll('b')).map((b, i) => {
      const bRect = b.getBoundingClientRect();
      const style = window.getComputedStyle(b);
      return {
        index: i + 1,
        top: style.top,
        marginTop: style.marginTop,
        height: style.height,
        width: style.width,
        opacity: style.opacity,
        display: style.display,
        visibility: style.visibility,
        transform: style.transform,
        bRect: { top: bRect.top, left: bRect.left, width: bRect.width, height: bRect.height }
      };
    });
    return {
      btnClass: btn.className,
      btnTransform: window.getComputedStyle(btn).transform,
      bars
    };
  });

  console.log('BTN INFO AFTER CLOSE:', JSON.stringify(btnInfoAfterClose, null, 2));
});
