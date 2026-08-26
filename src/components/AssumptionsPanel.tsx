"use client";

import { AnimatePresence, motion } from "framer-motion";
import NumberInput from "@/components/NumberInput";
import PillSelect from "@/components/PillSelect";
import { HORIZON_OPTIONS, REBALANCE_OPTIONS, TAX_BRACKETS } from "@/lib/simulate";

interface AssumptionsPanelProps {
  open: boolean;
  onToggle: () => void;
  returnPct: string;
  onReturnPctChange: (v: string) => void;
  taxRate: number;
  onTaxRateChange: (v: number) => void;
  rebalancesPerYear: number;
  onRebalancesChange: (v: number) => void;
  years: number;
  onYearsChange: (v: number) => void;
}

export default function AssumptionsPanel({
  open,
  onToggle,
  returnPct,
  onReturnPctChange,
  taxRate,
  onTaxRateChange,
  rebalancesPerYear,
  onRebalancesChange,
  years,
  onYearsChange,
}: AssumptionsPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-ink">Adjust the assumptions</span>
        <svg
          className={`w-4 h-4 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-5 border-t border-line">
              <NumberInput
                id="return-rate"
                label="Average annual return"
                helperText="7% is the S&P 500's long-run average after inflation. The nominal average is closer to 10%, so these totals are in today's dollars."
                value={returnPct}
                onChange={onReturnPctChange}
                suffix="%"
                placeholder="7"
                className="pt-4"
              />

              <PillSelect
                label="Tax bracket (on short-term gains)"
                value={taxRate}
                onChange={onTaxRateChange}
                options={TAX_BRACKETS.map((r) => ({ value: r, label: `${Math.round(r * 100)}%` }))}
              />

              <PillSelect
                label="How often you sell and rebuy"
                value={rebalancesPerYear}
                onChange={onRebalancesChange}
                options={REBALANCE_OPTIONS}
              />

              <PillSelect
                label="Time horizon"
                value={years}
                onChange={onYearsChange}
                options={HORIZON_OPTIONS.map((y) => ({ value: y, label: `${y} yrs` }))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
