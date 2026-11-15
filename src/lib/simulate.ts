import { BRACKET_RATES, INFLATION, bracketInfo, longTermTax, shortTermTax } from "@/lib/tax2026";

export interface SimInputs {
  /** What goes in each month, in today's dollars. It rises with prices so it stays the same in today's money. */
  monthlyContribution: number;
  /** Yearly return after inflation, compounded (0.07 is 7%). */
  annualReturn: number;
  /** The 2026 federal bracket the student's other income puts them in (0.12 is 12%). */
  taxRate: number;
  /** How many times a year the "sell and rebuy" portfolio sells everything. */
  rebalancesPerYear: number;
  years: number;
}

export interface YearPoint {
  year: number;
  /** What each person would walk away with if they sold everything at the end of this year, after tax. */
  holdKeep: number;
  activeKeep: number;
  /** Account values before any final sale. */
  holdValue: number;
  activeValue: number;
}

export interface SimResult {
  points: YearPoint[];
  /** Account values at the end, before selling. */
  holdValue: number;
  activeValue: number;
  /** Tax each would owe on selling everything at the end. */
  holdTaxOnSale: number;
  activeTaxOnSale: number;
  /** What each walks away with after that tax. */
  holdKeep: number;
  activeKeep: number;
  /** Tax the sell-and-rebuy portfolio paid along the way. */
  taxPaidAlongTheWay: number;
  totalContributed: number;
  /** Cash in hand: how much more leaving it alone keeps, after all tax. Negative when selling comes out ahead. */
  gap: number;
  /** The same gap as a share of what the seller keeps. */
  gapPct: number;
  /** The gap if neither ever sells at the end (the holder's tax is never paid). */
  gapIfNeverSold: number;
}

export const DEFAULT_INPUTS: SimInputs = {
  monthlyContribution: 200,
  annualReturn: 0.07,
  // Most students are in the 10% or 12% bracket: 12% runs to $50,400 of taxable income in 2026.
  taxRate: 0.12,
  rebalancesPerYear: 2,
  years: 20,
};

export const TAX_BRACKETS = BRACKET_RATES;

export const REBALANCE_OPTIONS = [
  { value: 1, label: "Once a year", phrase: "once a year" },
  { value: 2, label: "Twice a year", phrase: "twice a year" },
  { value: 4, label: "4 times a year", phrase: "4 times a year" },
  { value: 12, label: "Monthly", phrase: "every month" },
];

export const HORIZON_OPTIONS = [10, 20, 30, 40];

export const QUICK_CONTRIBUTIONS = [100, 200, 500];

/** The largest monthly amount the field takes. Past this the result is no longer about a student's money. */
export const MAX_MONTHLY = 100_000;

/**
 * Two portfolios get the same contribution at the end of every month. "Hold" never sells. "Active" sells
 * everything and buys back in every 12 / rebalancesPerYear months, paying short-term tax on the gain out of the
 * sale. Both grow at the same steady rate.
 *
 * The IRS taxes the dollar gain, inflation included, so the model runs in dollars: the return is the real
 * return plus 3% inflation, and the contribution rises with prices. Brackets rise with prices too, so each gain is
 * taxed in today's dollars and every figure returned is in today's dollars.
 *
 * Gains are taxed as if the student's other income sits at the bottom of the chosen bracket, and gains realized
 * in the same year stack on each other. Selling everything at the end, purchases held more than a year are
 * long-term (0%, 15% or 20%) and the rest short-term.
 */
export function simulate(inputs: SimInputs): SimResult {
  const { monthlyContribution, annualReturn, taxRate, rebalancesPerYear, years } = inputs;
  const months = Math.round(years * 12);
  const growth = Math.pow((1 + annualReturn) * (1 + INFLATION), 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + INFLATION, 1 / 12);
  const sellEvery = Math.max(1, Math.round(12 / rebalancesPerYear));
  const otherIncome = bracketInfo(taxRate).from;

  // Dollars put in each month, kept so the final sale can tell purchases held over a year from newer ones.
  const contributions: number[] = [];
  let hold = 0;
  let holdBasis = 0;
  let active = 0;
  let activeBasis = 0;
  let realizedThisYear = 0; // today's dollars
  let taxPaid = 0; // today's dollars

  // Tax on selling the hold portfolio at the end of month `end`, in today's dollars. A purchase held 12 months
  // or less is short-term (IRS Topic 409: "one year or less").
  const holdTaxAt = (end: number, price: number) => {
    let recentGain = 0;
    for (let m = Math.max(1, end - 12); m <= end; m++) {
      recentGain += contributions[m - 1] * (Math.pow(1 + growth, end - m) - 1);
    }
    const shortTerm = Math.max(0, recentGain / price);
    const longTerm = Math.max(0, (hold - holdBasis) / price - shortTerm);
    return shortTermTax(otherIncome, shortTerm) + longTermTax(otherIncome + shortTerm, longTerm);
  };
  const activeTaxAt = (price: number) => shortTermTax(otherIncome + realizedThisYear, (active - activeBasis) / price);

  const points: YearPoint[] = [{ year: 0, holdKeep: 0, activeKeep: 0, holdValue: 0, activeValue: 0 }];
  let price = 1;

  for (let month = 1; month <= months; month++) {
    if ((month - 1) % 12 === 0) realizedThisYear = 0;
    price = Math.pow(monthlyInflation, month);
    const put = monthlyContribution * price;
    contributions.push(put);

    hold = hold * (1 + growth) + put;
    holdBasis += put;
    active = active * (1 + growth) + put;
    activeBasis += put;

    if (month % sellEvery === 0) {
      const gain = (active - activeBasis) / price;
      if (gain > 0) {
        const tax = shortTermTax(otherIncome + realizedThisYear, gain);
        realizedThisYear += gain;
        taxPaid += tax;
        active -= tax * price;
      }
      activeBasis = active;
    }

    if (month % 12 === 0) {
      const holdValue = hold / price;
      const activeValue = active / price;
      points.push({
        year: month / 12,
        holdValue,
        activeValue,
        holdKeep: holdValue - holdTaxAt(month, price),
        activeKeep: activeValue - activeTaxAt(price),
      });
    }
  }

  const holdValue = hold / price;
  const activeValue = active / price;
  const holdTaxOnSale = months > 0 ? holdTaxAt(months, price) : 0;
  const activeTaxOnSale = activeTaxAt(price);
  const holdKeep = holdValue - holdTaxOnSale;
  const activeKeep = activeValue - activeTaxOnSale;
  const gap = holdKeep - activeKeep;

  return {
    points,
    holdValue,
    activeValue,
    holdTaxOnSale,
    activeTaxOnSale,
    holdKeep,
    activeKeep,
    taxPaidAlongTheWay: taxPaid,
    totalContributed: monthlyContribution * months,
    gap,
    // "Leaving it alone keeps X% more" compares against what the seller keeps, so that is the base.
    gapPct: activeKeep > 0 ? gap / activeKeep : 0,
    gapIfNeverSold: holdValue - activeValue,
  };
}
