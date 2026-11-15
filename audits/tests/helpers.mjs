// Shared helpers for the Playwright suite. Each test gets a fresh browser context. The helpers drive the controls
// by the words a student sees, and those words cover both the pre-audit build and this one, so the same tests run
// against the live site (where the money tests fail) and the audited build (where they pass).
// Created with Claude Code for the 2026-11-15 audit, adapted from the Loan Desk kit.
import { test, expect } from '@playwright/test';

export { test, expect };

export const PHONE = { width: 375, height: 812 };
export const DESKTOP = { width: 1440, height: 900 };

/**
 * Marks a test as a known issue. The test asserts the fixed behaviour, so today it fails and Playwright counts
 * that as expected. Once the issue is fixed, Playwright reports "expected to fail, but passed": delete the
 * knownIssue() call. AUDIT_SHOW_KNOWN=1 runs known issues as ordinary tests, which shows the real failure.
 */
export function knownIssue(id) {
  test.info().annotations.push({ type: 'issue', description: id });
  test.fail(!process.env.AUDIT_SHOW_KNOWN, `Known issue ${id}: see audits/REPORT.md`);
}

export async function openApp(page) {
  await page.goto('/');
  await expect(page.locator('#monthly')).toBeVisible();
}

const SALES = {
  1: /^(1x\/yr|Once a year)$/,
  2: /^(2x\/yr|Twice a year)$/,
  4: /^(4x\/yr|4 times a year)$/,
  12: /^Monthly$/,
};

async function pick(page, re) {
  await page.getByText(re).first().click();
}

/** Opens the assumptions if they are closed. */
export async function openAssumptions(page) {
  const toggle = page.getByRole('button', { name: /^Adjust the assumptions/ });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

/** Types the inputs the way a student would. Leaves out anything not given. */
export async function setInputs(page, { monthly, bracket, salesPerYear, years, returnPct } = {}) {
  if (monthly !== undefined) await page.locator('#monthly').fill(String(monthly));
  if (bracket === undefined && salesPerYear === undefined && years === undefined && returnPct === undefined) return;
  await openAssumptions(page);
  if (bracket !== undefined) await pick(page, new RegExp(`^${Math.round(bracket * 100)}%$`));
  if (salesPerYear !== undefined) await pick(page, SALES[salesPerYear]);
  if (years !== undefined) await pick(page, new RegExp(`^${years} (yrs|years)$`));
  if (returnPct !== undefined) {
    await page.locator('#return-rate').fill(String(returnPct));
    await page.locator('#return-rate').blur();
  }
}

export const dollars = text => {
  const m = String(text ?? '').match(/-?\$[\d,]+/);
  return m ? Number(m[0].replace(/[$,]/g, '')) : NaN;
};

async function textOf(locator) {
  return (await locator.count()) ? (await locator.first().innerText()).replace(/\s+/g, ' ') : '';
}

/**
 * Reads every figure the result shows. On the pre-audit build the headline and the two cards are read from its
 * own layout ("doing nothing is worth", "Hold, never sell", "Sell & rebuy"); it shows no tax figures, so those
 * come back as NaN.
 */
export async function readResult(page) {
  // Wait until the figures stop changing, so a read never lands between two renders.
  let last = null;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(100);
    const now = await page.locator('main, body').first().innerText();
    if (now === last) break;
    last = now;
  }
  if (await page.locator('#answer-figure').count()) {
    const hold = page.locator('dl > div', { hasText: 'Leave it alone' });
    const sell = page.locator('dl > div', { hasText: 'Sell and rebuy' });
    const holdNote = await textOf(hold.locator('dd').nth(1));
    const lead = await textOf(page.locator('#answer-figure').locator('xpath=preceding-sibling::p[1]'));
    return {
      lead,
      headline: dollars(await textOf(page.locator('#answer-figure'))),
      holdKeep: dollars(await textOf(hold.locator('strong'))),
      activeKeep: dollars(await textOf(sell.locator('strong'))),
      holdValue: dollars(holdNote),
      holdTax: dollars(holdNote.split('less')[1]),
      taxPaid: dollars(await textOf(sell.locator('dd').nth(1))),
      neverSold: dollars((await textOf(page.getByText(/the gap is/))).split('the gap is')[1]),
    };
  }
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const after = (label, text = body) => dollars(text.split(label)[1]);
  return {
    lead: body.match(/over \d+ years, doing nothing is worth/i)?.[0] ?? '',
    headline: after(/doing nothing is worth/i),
    holdKeep: after(/Hold, never sell/i),
    activeKeep: after(/Sell & rebuy/i),
    holdValue: after(/Hold, never sell/i),
    holdTax: NaN,
    taxPaid: NaN,
    neverSold: NaN,
  };
}

/** The table of years, as numbers: [{ year, hold, sell, gap }]. */
export async function readTable(page) {
  await page.getByText('See it year by year').click();
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  const out = [];
  for (const row of await rows.all()) {
    const cells = (await row.locator('th, td').allInnerTexts()).map(t => t.trim());
    out.push({ year: Number(cells[0]), hold: dollars(cells[1]), sell: dollars(cells[2]), gap: dollars(cells[3]) });
  }
  return out;
}
