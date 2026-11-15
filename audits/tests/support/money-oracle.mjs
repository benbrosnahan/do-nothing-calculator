// Independent money oracle for the Do-Nothing Calculator. Written from the primary sources below, never from the
// app's code: it keeps every monthly purchase as its own tax lot, where the app keeps one balance and one cost basis.
// Created with Claude Code for the 2026-11-15 audit.
//
// Sources, read 2026-11-15:
//   - Rev. Proc. 2025-32, section 4.01 Table 3 (2026 brackets, unmarried individuals) and section 4.03 (2026
//     maximum zero rate amount $49,450 and maximum 15% rate amount $545,500, "all other individuals").
//     https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
//   - IRS Topic 409: held more than one year is long-term, one year or less is short-term; net short-term gains are
//     taxed as ordinary income at graduated rates. https://www.irs.gov/taxtopics/tc409
//   - Inflation: CPI-U (CPIAUCNS) went from 17.3 in December 1927 to 324.054 in December 2025, 3.04% a year.
//     https://fred.stlouisfed.org/series/CPIAUCNS
//   - Monthly growth from an annual rate R compounds to R: (1 + R)^(1/12) - 1.

/** 2026 ordinary brackets, single filer: [rate, top of the bracket in taxable income]. */
export const BRACKETS_2026 = [
  [0.10, 12_400],
  [0.12, 50_400],
  [0.22, 105_700],
  [0.24, 201_775],
  [0.32, 256_225],
  [0.35, 640_600],
  [0.37, Infinity],
];
export const LTCG_2026 = { zeroTop: 49_450, fifteenTop: 545_500 };
export const INFLATION = 0.03;

/** Taxable income at the bottom of the bracket with this rate. */
export function bracketFloor(rate) {
  const i = BRACKETS_2026.findIndex(([r]) => Math.abs(r - rate) < 1e-9);
  if (i < 0) throw new Error(`not a 2026 bracket: ${rate}`);
  return i === 0 ? 0 : BRACKETS_2026[i - 1][1];
}

/** Ordinary income tax on a taxable income, from the Table 3 schedule. */
export function ordinaryTax(income) {
  let tax = 0;
  let below = 0;
  for (const [rate, top] of BRACKETS_2026) {
    if (income <= below) break;
    tax += (Math.min(income, top) - below) * rate;
    below = top;
  }
  return tax;
}

/** Tax on a long-term gain stacked on top of ordinary taxable income (the 0/15/20% schedule, section 1(h)). */
export function longTermTax(ordinaryIncome, gain) {
  if (gain <= 0) return 0;
  const at0 = Math.max(0, Math.min(gain, LTCG_2026.zeroTop - ordinaryIncome));
  const at15 = Math.max(0, Math.min(gain - at0, LTCG_2026.fifteenTop - Math.max(ordinaryIncome, LTCG_2026.zeroTop)));
  const at20 = gain - at0 - at15;
  return at15 * 0.15 + at20 * 0.2;
}

/**
 * Two portfolios fed the same contribution at the end of every month, rising with inflation so it stays the same
 * in today's dollars. "hold" never sells. "trade" sells every lot every 12/salesPerYear months, pays tax on the
 * gain out of the sale, and buys back with what is left. Brackets are indexed, so tax is worked out in today's
 * dollars: each gain is deflated to today, taxed, and the tax inflated back. Gains inside one tax year stack.
 * At the end both cash out: lots held 12 months or less are short-term, the rest long-term.
 * Every figure returned is in today's dollars.
 */
export function oracle({ monthly, realReturn, bracket, salesPerYear, years, inflation = INFLATION }) {
  const months = years * 12;
  const nominal = (1 + realReturn) * (1 + inflation) - 1;
  const g = Math.pow(1 + nominal, 1 / 12) - 1;
  const priceAt = m => Math.pow(1 + inflation, m / 12);
  const every = 12 / salesPerYear;
  const floor = bracketFloor(bracket);

  const hold = []; // { month, cost, value }
  let trade = [];
  let ytdGain = 0; // short-term gains realized so far this tax year, today's dollars
  let taxPaid = 0; // today's dollars
  const points = [{ year: 0, hold: 0, trade: 0 }];

  for (let m = 1; m <= months; m++) {
    if ((m - 1) % 12 === 0) ytdGain = 0;
    for (const lot of hold) lot.value *= 1 + g;
    for (const lot of trade) lot.value *= 1 + g;
    const c = monthly * priceAt(m);
    hold.push({ month: m, cost: c, value: c });
    trade.push({ month: m, cost: c, value: c });

    if (m % every === 0) {
      const value = trade.reduce((s, l) => s + l.value, 0);
      const gain = value - trade.reduce((s, l) => s + l.cost, 0);
      let tax = 0;
      if (gain > 0) {
        const real = gain / priceAt(m);
        const realTax = ordinaryTax(floor + ytdGain + real) - ordinaryTax(floor + ytdGain);
        ytdGain += real;
        taxPaid += realTax;
        tax = realTax * priceAt(m);
      }
      trade = [{ month: m, cost: value - tax, value: value - tax }];
    }
    if (m % 12 === 0) {
      const p = priceAt(m);
      points.push({
        year: m / 12,
        hold: hold.reduce((s, l) => s + l.value, 0) / p,
        trade: trade.reduce((s, l) => s + l.value, 0) / p,
      });
    }
  }

  const P = priceAt(months);
  const sum = (lots, f) => lots.reduce((s, l) => s + f(l), 0);
  const holdValue = sum(hold, l => l.value) / P;
  const tradeValue = sum(trade, l => l.value) / P;
  const shortTerm = lots => sum(lots.filter(l => months - l.month <= 12), l => l.value - l.cost) / P;
  const longTerm = lots => sum(lots.filter(l => months - l.month > 12), l => l.value - l.cost) / P;
  const cashOutTax = lots => {
    const st = Math.max(0, shortTerm(lots));
    const stTax = ordinaryTax(floor + st) - ordinaryTax(floor);
    return stTax + longTermTax(floor + st, Math.max(0, longTerm(lots)));
  };
  // The trader's last sale can fall in the same tax year as the cash-out; stack on what was realized then.
  const tradeTax = (() => {
    const st = Math.max(0, shortTerm(trade) + longTerm(trade));
    return ordinaryTax(floor + ytdGain + st) - ordinaryTax(floor + ytdGain);
  })();
  const holdTax = cashOutTax(hold);
  const holdKeep = holdValue - holdTax;
  const tradeKeep = tradeValue - tradeTax;
  return {
    holdValue,
    tradeValue,
    holdTax,
    tradeTax,
    holdKeep,
    tradeKeep,
    gap: holdKeep - tradeKeep,
    gapIfNeverSold: holdValue - tradeValue,
    taxPaid,
    contributed: monthly * months,
    points,
  };
}

/** The pre-audit model, as the live site computes it, for measuring how far off it was: 7%/12 a month, no
 *  inflation, a flat rate on every gain, and no tax when the holder sells. */
export function preAuditModel({ monthly, realReturn, bracket, salesPerYear, years }) {
  const r = realReturn / 12;
  const every = Math.round(12 / salesPerYear);
  let hold = 0, trade = 0, basis = 0;
  for (let m = 1; m <= years * 12; m++) {
    hold = hold * (1 + r) + monthly;
    trade = trade * (1 + r) + monthly;
    basis += monthly;
    if (m % every === 0) {
      const gain = trade - basis;
      if (gain > 0) trade -= gain * bracket;
      basis = trade;
    }
  }
  return { holdValue: hold, tradeValue: trade, gap: hold - trade };
}

/** Closed form for the hold portfolio's value, a cross-check on the lot loop: contributions growing at the
 *  monthly inflation factor q, invested at the end of each month and grown at g: sum of q^m (1+g)^(M-m). */
export function holdClosedForm({ monthly, realReturn, years, inflation = INFLATION }) {
  const M = years * 12;
  const g = Math.pow((1 + realReturn) * (1 + inflation), 1 / 12) - 1;
  const q = Math.pow(1 + inflation, 1 / 12);
  const x = q / (1 + g);
  const nominal = monthly * Math.pow(1 + g, M) * (x * (1 - Math.pow(x, M))) / (1 - x);
  return nominal / Math.pow(q, M);
}
