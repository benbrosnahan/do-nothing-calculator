export interface SimInputs {
  monthlyContribution: number;
  annualReturn: number;
  taxRate: number;
  rebalancesPerYear: number;
  years: number;
}

export interface YearPoint {
  year: number;
  holdValue: number;
  activeValue: number;
}

export interface SimResult {
  points: YearPoint[];
  holdFinal: number;
  activeFinal: number;
  totalContributed: number;
  taxDrag: number;
  taxDragPct: number;
}

export const DEFAULT_INPUTS: SimInputs = {
  monthlyContribution: 200,
  annualReturn: 0.07,
  taxRate: 0.22,
  rebalancesPerYear: 2,
  years: 20,
};

export const TAX_BRACKETS = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];

export const REBALANCE_OPTIONS = [
  { value: 1, label: "1x/yr" },
  { value: 2, label: "2x/yr" },
  { value: 4, label: "4x/yr" },
  { value: 12, label: "Monthly" },
];

export const HORIZON_OPTIONS = [10, 20, 30, 40];

export const QUICK_CONTRIBUTIONS = [100, 200, 500];

/**
 * Simulates two portfolios receiving the same monthly contribution:
 * "hold" never sells. "active" sells everything and rebuys at each
 * rebalance point, realizing short-term capital gains tax on the way.
 */
export function simulate(inputs: SimInputs): SimResult {
  const { monthlyContribution, annualReturn, taxRate, rebalancesPerYear, years } = inputs;
  const monthlyRate = annualReturn / 12;
  const totalMonths = Math.round(years * 12);
  const rebalanceEvery = Math.max(1, Math.round(12 / rebalancesPerYear));

  let hold = 0;
  let active = 0;
  let activeBasis = 0;

  const points: YearPoint[] = [{ year: 0, holdValue: 0, activeValue: 0 }];

  for (let month = 1; month <= totalMonths; month++) {
    hold = hold * (1 + monthlyRate) + monthlyContribution;
    active = active * (1 + monthlyRate) + monthlyContribution;
    activeBasis += monthlyContribution;

    if (month % rebalanceEvery === 0) {
      const gain = active - activeBasis;
      if (gain > 0) {
        active -= gain * taxRate;
      }
      activeBasis = active;
    }

    if (month % 12 === 0) {
      points.push({ year: month / 12, holdValue: hold, activeValue: active });
    }
  }

  const totalContributed = monthlyContribution * totalMonths;
  const taxDrag = hold - active;

  return {
    points,
    holdFinal: hold,
    activeFinal: active,
    totalContributed,
    taxDrag,
    // "Holding is worth X% more than trading" is a comparison against the
    // trader's outcome, so the smaller number is the base. Dividing by `hold`
    // instead would answer a different question and understate the gap.
    taxDragPct: active > 0 ? taxDrag / active : 0,
  };
}
