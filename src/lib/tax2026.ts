// Federal tax figures the calculator uses, with where each one comes from. Read 2026-11-15.
//
// - 2026 brackets, single filer: Rev. Proc. 2025-32, section 4.01, Table 3.
//   https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
// - 2026 long-term capital gains: 0% up to $49,450 of taxable income, 15% up to $545,500, 20% above.
//   Rev. Proc. 2025-32, section 4.03 ("all other individuals").
// - Short-term (held one year or less) is taxed as ordinary income; long-term is held more than one year.
//   IRS Topic 409. https://www.irs.gov/taxtopics/tc409
// - Inflation: CPI-U rose from 17.3 (December 1927) to 324.054 (December 2025), 3.04% a year.
//   https://fred.stlouisfed.org/series/CPIAUCNS
// - Return: the S&P 500 with dividends returned 10.0% a year from 1928 to 2025, 6.8% after that inflation.
//   https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html

/** Long-run inflation the model assumes, so tax can be charged on dollar gains, as the IRS charges it. */
export const INFLATION = 0.03;

/** The 2026 schedule as the IRS prints it: over this much taxable income, the tax is base plus rate of the excess. */
const SCHEDULE = [
  { over: 0, base: 0, rate: 0.1 },
  { over: 12_400, base: 1_240, rate: 0.12 },
  { over: 50_400, base: 5_800, rate: 0.22 },
  { over: 105_700, base: 17_966, rate: 0.24 },
  { over: 201_775, base: 41_024, rate: 0.32 },
  { over: 256_225, base: 58_448, rate: 0.35 },
  { over: 640_600, base: 192_979.25, rate: 0.37 },
] as const;

/** Long-term rates by the taxable income they apply up to. */
const LONG_TERM = [
  { upTo: 49_450, rate: 0 },
  { upTo: 545_500, rate: 0.15 },
  { upTo: Infinity, rate: 0.2 },
] as const;

export const BRACKET_RATES = SCHEDULE.map((s) => s.rate);

export interface BracketInfo {
  rate: number;
  /** Taxable income where the bracket starts. */
  from: number;
  /** Where it ends, or null for the top bracket. */
  to: number | null;
  /** The long-term rate on the first dollar of gain at the start of this bracket. */
  longTermRate: number;
}

export function bracketInfo(rate: number): BracketInfo {
  const i = SCHEDULE.findIndex((s) => Math.abs(s.rate - rate) < 1e-9);
  if (i < 0) throw new Error(`Not a 2026 bracket: ${rate}`);
  const from = SCHEDULE[i].over;
  const to = i + 1 < SCHEDULE.length ? SCHEDULE[i + 1].over : null;
  const longTermRate = LONG_TERM.find((b) => from < b.upTo)!.rate;
  return { rate, from, to, longTermRate };
}

/** Federal income tax on a taxable income, single filer, 2026. */
export function ordinaryTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let row: (typeof SCHEDULE)[number] = SCHEDULE[0];
  for (const s of SCHEDULE) if (taxableIncome > s.over) row = s;
  return row.base + row.rate * (taxableIncome - row.over);
}

/** Tax on a short-term gain added on top of other taxable income. */
export function shortTermTax(otherIncome: number, gain: number): number {
  if (gain <= 0) return 0;
  return ordinaryTax(otherIncome + gain) - ordinaryTax(otherIncome);
}

/** Tax on a long-term gain, which sits on top of ordinary income and fills the 0%, 15% and 20% bands in turn. */
export function longTermTax(otherIncome: number, gain: number): number {
  let tax = 0;
  let start = otherIncome;
  let left = Math.max(0, gain);
  for (const band of LONG_TERM) {
    if (left <= 0) break;
    const part = Math.min(left, Math.max(0, band.upTo - start));
    tax += part * band.rate;
    left -= part;
    start += part;
  }
  return tax;
}
