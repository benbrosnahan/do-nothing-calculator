"use client";

import NumberInput from "@/components/NumberInput";
import PillSelect from "@/components/PillSelect";
import { HORIZON_OPTIONS, REBALANCE_OPTIONS, TAX_BRACKETS } from "@/lib/simulate";
import { bracketInfo } from "@/lib/tax2026";
import { formatFull } from "@/lib/utils";

interface AssumptionsPanelProps {
  open: boolean;
  onToggle: () => void;
  returnPct: string;
  onReturnPctChange: (v: string) => void;
  onReturnPctBlur: () => void;
  taxRate: number;
  onTaxRateChange: (v: number) => void;
  rebalancesPerYear: number;
  onRebalancesChange: (v: number) => void;
  years: number;
  onYearsChange: (v: number) => void;
}

const pct = (r: number) => `${Math.round(r * 100)}%`;

function bracketRange(rate: number): string {
  const { from, to } = bracketInfo(rate);
  if (from === 0) return `taxable income up to ${formatFull(to!)}`;
  if (to === null) return `taxable income over ${formatFull(from)}`;
  return `taxable income from ${formatFull(from)} to ${formatFull(to)}`;
}

export default function AssumptionsPanel({
  open,
  onToggle,
  returnPct,
  onReturnPctChange,
  onReturnPctBlur,
  taxRate,
  onTaxRateChange,
  rebalancesPerYear,
  onRebalancesChange,
  years,
  onYearsChange,
}: AssumptionsPanelProps) {
  return (
    <section id="assumptions" className="scroll-mt-4 rounded-3xl border border-line bg-white shadow-card">
      <h2 className="m-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="assumptions-body"
          className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-3xl px-5 text-left text-base font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 sm:px-6"
        >
          <span>Adjust the assumptions</span>
          <svg
            aria-hidden
            className={`h-5 w-5 flex-shrink-0 text-slate-700 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h2>
      {open && (
        <div id="assumptions-body" className="unfold space-y-7 border-t border-line px-5 pb-6 pt-5 sm:px-6">
          <PillSelect
            label="Your tax bracket"
            value={taxRate}
            onChange={onTaxRateChange}
            options={TAX_BRACKETS.map((r) => ({ value: r, label: pct(r) }))}
            help={
              <>
                <p>
                  {pct(taxRate)} is {bracketRange(taxRate)} in 2026, for a single filer. Taxable income is roughly your
                  pay minus the $16,100 standard deduction. Most students are in 10% or 12%.
                </p>
                <p className="mt-2">
                  Under 24, a student, and mostly supported by your parents? Investment income over $2,700 a year can
                  be taxed at their rate instead.
                </p>
              </>
            }
          />

          <PillSelect
            label="How often you sell and rebuy"
            value={rebalancesPerYear}
            onChange={onRebalancesChange}
            options={REBALANCE_OPTIONS}
            help="Each sale comes within a year of buying, so every gain is short-term and taxed at your bracket."
          />

          <PillSelect
            label="How long you invest"
            value={years}
            onChange={onYearsChange}
            options={HORIZON_OPTIONS.map((y) => ({ value: y, label: `${y} years` }))}
          />

          <NumberInput
            id="return-rate"
            label="Yearly return after inflation"
            helperText="7% is close to what the S&P 500 returned a year after inflation from 1928 to 2025 (6.8%, or about 10% before inflation). Past returns are not a promise."
            value={returnPct}
            onChange={onReturnPctChange}
            onBlur={onReturnPctBlur}
            suffix="%"
            placeholder="7"
          />
        </div>
      )}
    </section>
  );
}
