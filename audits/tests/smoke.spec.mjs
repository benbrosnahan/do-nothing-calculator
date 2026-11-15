// Smoke tests: the page loads, the main controls work, and nothing errors. Created with Claude Code, 2026-11-15.
import { test, expect, openApp, openAssumptions, readResult, PHONE } from './helpers.mjs';

test('loads with its name, a main landmark and a result, with no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(e.message));
  await openApp(page);
  await expect(page.getByRole('heading', { level: 1, name: 'The Do-Nothing Calculator' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('#answer-figure')).toHaveText(/^\$[\d,]+$/);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('the quick amounts and the typed amount change the answer', async ({ page }) => {
  await openApp(page);
  const first = (await readResult(page)).headline;
  await page.getByRole('button', { name: '$500' }).click();
  await expect(page.locator('#monthly')).toHaveValue('500');
  await expect(page.getByRole('button', { name: '$500' })).toHaveAttribute('aria-pressed', 'true');
  const more = (await readResult(page)).headline;
  expect(more).toBeGreaterThan(first);
  await page.locator('#monthly').fill('1,2a34');
  await expect(page.locator('#monthly')).toHaveValue('1,234');
});

test('"Change these" opens the assumptions, and the radios move with arrow keys', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Change these' }).click();
  await expect(page.getByRole('button', { name: 'Adjust the assumptions' })).toHaveAttribute('aria-expanded', 'true');
  const twelve = page.getByRole('radio', { name: '12%', exact: true });
  await twelve.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: '22%', exact: true })).toBeChecked();
  await expect(page.getByText(/At the 22% tax bracket/)).toBeVisible();
});

test('content is visible without waiting on script animation (CSS entrances only)', async ({ page }) => {
  await openApp(page);
  // A framer-motion entrance leaves inline opacity on its wrappers; CSS keyframes do not.
  const inlineOpacity = await page.evaluate(() => [...document.querySelectorAll('[style*="opacity"]')].length);
  expect(inlineOpacity).toBe(0);
});

test.describe('phone', () => {
  test.use({ viewport: PHONE });
  test('nothing scrolls sideways at 375 and 320 px', async ({ page }) => {
    await openApp(page);
    await openAssumptions(page);
    for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 812 });
      await page.waitForTimeout(300); // the chart re-measures its width after a resize
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `scrolls sideways at ${width}px`).toBe(0);
    }
  });
});

test('UX-04 axis labels are round, readable amounts', async ({ page }) => {
  await openApp(page);
  await page.locator('#monthly').fill('10000');
  await page.getByRole('button', { name: 'Adjust the assumptions' }).click();
  await page.locator('#return-rate').fill('0');
  await page.locator('#return-rate').blur();
  await page.waitForTimeout(300);
  const labels = await page.locator('figure svg[aria-hidden] text').allTextContents();
  expect(labels).toContain('$2.5M');
  expect(labels).toContain('$1.25M');
  for (const l of labels.filter(t => t.startsWith('$'))) expect(l).toMatch(/^\$\d+(\.\d+)?[kM]?$/);
});
