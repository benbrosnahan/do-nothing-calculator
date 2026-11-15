// Screenshots for the redesign loop: the default result and the assumptions opened, at phone and desktop sizes.
// Usage: node screenshots.mjs <base url> <out dir> [prefix] [--only-default]
// Created with Claude Code for the 2026-11-15 audit.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const onlyDefault = process.argv.includes('--only-default');
const [base = 'http://localhost:3205/', out = 'screenshots/after', prefix = ''] = args;
mkdirSync(out, { recursive: true });
const SIZES = { phone: { width: 375, height: 812 }, desktop: { width: 1440, height: 900 } };

const STATES = {
  result: async () => {},
  assumptions: async page => {
    await page.getByRole('button', { name: /^Adjust the assumptions/ }).click();
    await page.waitForTimeout(500);
  },
};

const browser = await chromium.launch();
for (const [size, viewport] of Object.entries(SIZES)) {
  for (const [name, enter] of Object.entries(STATES)) {
    if (onlyDefault && name !== 'result') continue;
    const page = await browser.newPage({ viewport });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await enter(page);
    const file = path.join(out, `${prefix}${name}-${size}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    await page.close();
  }
}
await browser.close();
