// Accessibility: axe on every state at phone and desktop, plus the Cense floors axe does not check (13px type,
// 40px tap targets, 16px inputs). Created with Claude Code, 2026-11-15.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, openApp, openAssumptions, PHONE, DESKTOP } from './helpers.mjs';

const STATES = {
  result: async () => {},
  assumptions: async page => openAssumptions(page),
  details: async page => {
    await openAssumptions(page);
    await page.getByText('See it year by year').click();
    await page.getByText('How this is worked out').click();
  },
};

for (const [size, viewport] of Object.entries({ phone: PHONE, desktop: DESKTOP })) {
  for (const [name, enter] of Object.entries(STATES)) {
    test(`A11Y-01 A11Y-02 A11Y-03 axe finds no WCAG 2.2 A or AA violations: ${name}, ${size}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openApp(page);
      await enter(page);
      await page.waitForTimeout(900);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations.map(v => `${v.id}: ${v.nodes.length} nodes`)).toEqual([]);
    });
  }
}

test('A11Y-04 no visible text is under 13px', async ({ page }) => {
  await openApp(page);
  await STATES.details(page);
  const small = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const el = node.parentElement;
      if (!node.textContent.trim() || !el || el.closest('.sr-only, noscript, script, style')) continue;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 13) out.push(`${size}px "${node.textContent.trim().slice(0, 30)}"`);
    }
    return out;
  });
  expect(small).toEqual([]);
});

test('A11Y-05 every control is at least 40px tall and inputs use 16px text', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await openApp(page);
  await STATES.details(page);
  const issues = await page.evaluate(() => {
    const out = [];
    const controls = [...document.querySelectorAll('main button, main summary, main input, main label:has(input[type=radio])')];
    for (const el of controls) {
      const target = el.matches('input[type=radio]') ? null : el;
      if (!target) continue;
      const r = target.getBoundingClientRect();
      if (!r.width) continue;
      const inline = target.closest('p');
      if (!inline && r.height < 40) out.push(`${r.height}px tall: ${target.textContent.trim().slice(0, 30) || target.id}`);
      if (target.tagName === 'INPUT' && parseFloat(getComputedStyle(target).fontSize) < 16) out.push(`input under 16px: ${target.id}`);
    }
    return out;
  });
  expect(issues).toEqual([]);
});

test('A11Y-06 motion stops for people who ask for less', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await openApp(page);
  const durations = await page.evaluate(() =>
    [...document.querySelectorAll('.rise, .reveal-gap')].map(el => parseFloat(getComputedStyle(el).animationDuration))
  );
  expect(durations.length).toBeGreaterThan(0);
  for (const d of durations) expect(d).toBeLessThan(0.01);
  await context.close();
});

test('A11Y-07 the chart has a text alternative with the figures, and a table', async ({ page }) => {
  await openApp(page);
  const label = await page.getByRole('img').first().getAttribute('aria-label');
  expect(label).toMatch(/leaving it alone keeps \$[\d,]+ and selling and rebuying twice a year keeps \$[\d,]+/);
  await page.getByText('See it year by year').click();
  await expect(page.locator('table tbody tr')).toHaveCount(20);
});
