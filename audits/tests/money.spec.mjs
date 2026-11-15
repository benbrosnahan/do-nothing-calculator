// Money tests. Every expected figure comes from support/money-oracle.mjs, which is written from the IRS and CPI
// sources and keeps each purchase as its own tax lot; nothing here imports the app's code. Figures on screen are
// whole dollars, so each check allows $1 for rounding.
// Created with Claude Code for the 2026-11-15 audit.
import { test, expect, openApp, openAssumptions, setInputs, readResult, readTable } from './helpers.mjs';
import { oracle, holdClosedForm } from './support/money-oracle.mjs';

const near = (actual, expected, label) =>
  expect(Math.abs(actual - Math.round(expected)), `${label}: shows ${actual}, should be ${Math.round(expected)}`).toBeLessThanOrEqual(1);

// Three students, plus the pre-audit default (22%).
const PROFILES = {
  'first-year default: $200 a month, 12% bracket, sells twice a year, 20 years': {
    monthly: 200, realReturn: 0.07, bracket: 0.12, salesPerYear: 2, years: 20,
  },
  'summer job: $100 a month, 10% bracket, sells every month, 10 years': {
    monthly: 100, realReturn: 0.07, bracket: 0.1, salesPerYear: 12, years: 10,
  },
  'new grad: $500 a month, 22% bracket, sells 4 times a year, 40 years': {
    monthly: 500, realReturn: 0.07, bracket: 0.22, salesPerYear: 4, years: 40,
  },
  'pre-audit default: $200 a month, 22% bracket, sells twice a year, 20 years': {
    monthly: 200, realReturn: 0.07, bracket: 0.22, salesPerYear: 2, years: 20,
  },
};

async function enter(page, p) {
  await openApp(page);
  await setInputs(page, { monthly: p.monthly, bracket: p.bracket, salesPerYear: p.salesPerYear, years: p.years, returnPct: p.realReturn * 100 });
  return readResult(page);
}

for (const [name, p] of Object.entries(PROFILES)) {
  test(`MONEY-01 MONEY-02 MONEY-03 MONEY-06 every figure matches the oracle: ${name}`, async ({ page }) => {
    const o = oracle(p);
    const r = await enter(page, p);
    near(r.headline, o.gap, 'headline: cash in hand, after all tax');
    near(r.holdKeep, o.holdKeep, 'leave it alone: you keep');
    near(r.activeKeep, o.tradeKeep, 'sell and rebuy: you keep');
    near(r.holdValue, o.holdValue, 'leave it alone: in the account');
    near(r.holdTax, o.holdTax, 'leave it alone: tax when you sell');
    near(r.taxPaid, o.taxPaid, 'sell and rebuy: tax along the way');
    near(r.neverSold, o.gapIfNeverSold, 'never sell: the gap');
  });
}

test('MONEY-01 a 7% year compounds to 7%, not 7.23%: $200 a month for 20 years is $101,507 in the account', async ({ page }) => {
  const p = { monthly: 200, realReturn: 0.07, years: 20 };
  const expected = holdClosedForm(p);
  expect(Math.round(expected)).toBe(101_507);
  const r = await enter(page, { ...p, bracket: 0.12, salesPerYear: 2 });
  near(r.holdValue, expected, 'leave it alone: in the account');
});

test('MONEY-02 tax is charged on the dollar gain, inflation included: 22% bracket, twice a year, 20 years', async ({ page }) => {
  const p = PROFILES['pre-audit default: $200 a month, 22% bracket, sells twice a year, 20 years'];
  const o = oracle(p);
  // Taxing only the after-inflation gain would leave the seller with about $85,200.
  expect(Math.round(o.tradeKeep)).toBe(79_201);
  const r = await enter(page, p);
  near(r.activeKeep, o.tradeKeep, 'sell and rebuy: you keep');
});

test('MONEY-03 the headline counts the tax the holder owes on selling, and nothing calls it a floor', async ({ page }) => {
  const p = PROFILES['pre-audit default: $200 a month, 22% bracket, sells twice a year, 20 years'];
  const o = oracle(p);
  expect(Math.round(o.holdTax)).toBe(9_793);
  const r = await enter(page, p);
  near(r.headline, o.gap, 'headline');
  await expect(page.getByText(/floor rather than a worst case/i)).toHaveCount(0);
  // The chart's last year and the table agree with the headline.
  const rows = await readTable(page);
  near(rows.at(-1).gap, o.gap, 'last row of the table');
});

test('MONEY-04 a first visit assumes the 12% bracket and says what income that is', async ({ page }) => {
  await openApp(page);
  const o = oracle(PROFILES['first-year default: $200 a month, 12% bracket, sells twice a year, 20 years']);
  const r = await readResult(page);
  near(r.headline, o.gap, 'default headline');
  await openAssumptions(page);
  await expect(page.getByRole('radio', { name: '12%', exact: true })).toBeChecked();
  await expect(page.getByText(/12% is taxable income from \$12,400 to \$50,400 in 2026/)).toBeVisible();
  await page.getByText(/^24%$/).click();
  await expect(page.getByText(/24% is taxable income from \$105,700 to \$201,775 in 2026/)).toBeVisible();
});

test('MONEY-05 the return is labelled with its period and both rates: 6.8% after inflation, about 10% before', async ({ page }) => {
  await openApp(page);
  await openAssumptions(page);
  const help = page.locator('#return-rate-help');
  await expect(help).toContainText('1928 to 2025');
  await expect(help).toContainText('6.8%');
  await expect(help).toContainText('10% before inflation');
  await expect(help).toContainText('not a promise');
});

test('MONEY-06 gains realized in one year stack and can reach the next bracket', async ({ page }) => {
  const p = PROFILES['new grad: $500 a month, 22% bracket, sells 4 times a year, 40 years'];
  const o = oracle(p);
  // At one flat 22% the seller would keep about $697,983; stacking into 24% leaves $697,533.
  expect(Math.round(o.tradeKeep)).toBe(697_533);
  const r = await enter(page, p);
  near(r.activeKeep, o.tradeKeep, 'sell and rebuy: you keep');
});

test('MONEY-07 selling once a year is named plainly and said to be short-term, with the over-a-year step', async ({ page }) => {
  await openApp(page);
  await openAssumptions(page);
  await expect(page.getByText('Once a year', { exact: true })).toBeVisible();
  await expect(page.getByText(/every gain is short-term/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'If you do sell' })).toBeVisible();
  await expect(page.getByText(/Hold it for more than a year first/)).toBeVisible();
});

test('MONEY-03 when selling comes out ahead, the headline says so instead of showing a negative gain', async ({ page }) => {
  // No real growth, large amounts, lowest bracket, once a year: the holder's 15% at the end outweighs the
  // seller's 10% to 22% along the way.
  const p = { monthly: 10000, realReturn: 0, bracket: 0.1, salesPerYear: 1, years: 20 };
  const o = oracle(p);
  expect(o.gap).toBeLessThan(-500);
  const r = await enter(page, p);
  expect(r.lead).toMatch(/selling and rebuying once a year gives you/);
  near(r.headline, -o.gap, 'headline shows the size of the lead');
});

test('SCOPE-01 SCOPE-02 SCOPE-03 the tax year, filing status, dependents and what is left out are stated', async ({ page }) => {
  await openApp(page);
  await openAssumptions(page);
  await expect(page.getByText(/in 2026, for a single filer/)).toBeVisible();
  await expect(page.getByText(/Investment income over \$2,700 a year can be taxed at their rate/)).toBeVisible();
  await page.getByText('How this is worked out').click();
  await expect(page.getByText(/Federal tax only\. State tax, and the 3\.8% tax/)).toBeVisible();
});

test('UX-05 a huge monthly amount is capped and said to be', async ({ page }) => {
  await openApp(page);
  await page.locator('#monthly').fill('5000000');
  await expect(page.getByText(/Worked out at the most this takes: \$100,000 a month/)).toBeVisible();
  const o = oracle({ monthly: 100000, realReturn: 0.07, bracket: 0.12, salesPerYear: 2, years: 20 });
  near((await readResult(page)).headline, o.gap, 'capped headline');
});

test('an empty amount shows a prompt, never NaN or $0', async ({ page }) => {
  await openApp(page);
  await page.locator('#monthly').fill('');
  await expect(page.getByText('Type a monthly amount to see the two lines.')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('NaN');
});
