"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import AssumptionsPanel from "@/components/AssumptionsPanel";
import GrowthChart from "@/components/GrowthChart";
import { DEFAULT_INPUTS, QUICK_CONTRIBUTIONS, simulate } from "@/lib/simulate";
import { cn, formatDollarInput, formatFull, parseDollarInput } from "@/lib/utils";

export default function Home() {
  const [contributionRaw, setContributionRaw] = useState(
    formatDollarInput(String(DEFAULT_INPUTS.monthlyContribution))
  );
  const [returnPct, setReturnPct] = useState(String(DEFAULT_INPUTS.annualReturn * 100));
  const [taxRate, setTaxRate] = useState(DEFAULT_INPUTS.taxRate);
  const [rebalancesPerYear, setRebalancesPerYear] = useState(DEFAULT_INPUTS.rebalancesPerYear);
  const [years, setYears] = useState(DEFAULT_INPUTS.years);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  const monthlyContribution = parseDollarInput(contributionRaw);
  const annualReturn = Math.max(0, Math.min(30, Number(returnPct) || 0)) / 100;

  const result = useMemo(
    () =>
      simulate({
        monthlyContribution,
        annualReturn,
        taxRate,
        rebalancesPerYear,
        years,
      }),
    [monthlyContribution, annualReturn, taxRate, rebalancesPerYear, years]
  );

  const hasMoney = monthlyContribution > 0;

  return (
    <>
      <Nav />
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-2xl space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink text-balance">The Do-Nothing Calculator</h1>
            <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">
              Two portfolios with the same monthly contribution. One is left alone, while the other is sold and
              rebought a few times a year. The difference worsens the longer you&apos;re invested, and the more you
              buy and sell.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.06 }}
          >
            <div className="bg-white rounded-2xl border border-line p-5">
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <label htmlFor="monthly" className="block text-sm font-semibold text-ink">
                  Monthly investment
                </label>
                <div className="flex gap-1.5">
                  {QUICK_CONTRIBUTIONS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setContributionRaw(formatDollarInput(String(amt)))}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors",
                        monthlyContribution === amt
                          ? "border-brand bg-brand text-white"
                          : "border-line text-ink-muted hover:border-brand-border"
                      )}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint pointer-events-none">$</span>
                <input
                  id="monthly"
                  type="text"
                  inputMode="numeric"
                  value={contributionRaw}
                  onChange={(e) => setContributionRaw(formatDollarInput(e.target.value))}
                  placeholder="200"
                  className={cn(
                    "w-full min-h-[48px] rounded-xl border border-line bg-white text-lg font-semibold text-ink pl-7 pr-3",
                    "placeholder:text-ink-faint/60 placeholder:font-normal placeholder:text-base",
                    "focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                  )}
                />
              </div>
            </div>
          </motion.div>

          {hasMoney ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
              >
                <div className="bg-brand rounded-2xl p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1.5">
                    Over {years} years, doing nothing is worth
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold">
                    {formatFull(result.taxDrag)}
                    <span className="text-base font-semibold text-white/70 ml-2">
                      ({Math.round(result.taxDragPct * 100)}% more)
                    </span>
                  </p>
                  <p className="text-sm text-white/80 mt-1.5 leading-relaxed">
                    Same contributions, same market. The only difference is how often you touched it.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.18 }}
              >
                <div className="bg-white rounded-2xl border border-line p-5">
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl bg-brand-light px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand/70">Hold, never sell</p>
                      <p className="text-xl font-bold text-brand mt-0.5">{formatFull(result.holdFinal)}</p>
                    </div>
                    <div className="rounded-xl bg-accent-light px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent/70">Sell &amp; rebuy</p>
                      <p className="text-xl font-bold text-accent mt-0.5">{formatFull(result.activeFinal)}</p>
                    </div>
                  </div>

                  <GrowthChart points={result.points} years={years} />

                  <p className="text-[10px] text-ink-faint mt-4 leading-relaxed">
                    Assumes a steady {(annualReturn * 100).toFixed(1)}% average annual return with no volatility,
                    {" "}${Math.round(result.totalContributed).toLocaleString()} total contributed over {years} years,
                    and short-term capital gains tax of {Math.round(taxRate * 100)}% paid on gains realized at every
                    sell-and-rebuy point.
                  </p>
                  <p className="text-[10px] text-ink-faint mt-2 leading-relaxed">
                    Both lines earn the exact same return. The entire gap is tax, not bad timing, so treat it as a
                    floor rather than a worst case. This drag applies in a taxable brokerage account. Inside a Roth
                    IRA or 401(k), selling does not trigger capital gains tax and this cost largely goes away.
                    Illustrative only, not tax advice.
                  </p>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="bg-white rounded-2xl border border-line border-dashed p-8 text-center">
                <p className="text-sm text-ink-muted">Enter a monthly amount above to see the two lines.</p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.24 }}
          >
            <AssumptionsPanel
              open={assumptionsOpen}
              onToggle={() => setAssumptionsOpen((v) => !v)}
              returnPct={returnPct}
              onReturnPctChange={setReturnPct}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              rebalancesPerYear={rebalancesPerYear}
              onRebalancesChange={setRebalancesPerYear}
              years={years}
              onYearsChange={setYears}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.35 }}>
            <p className="text-center text-xs text-ink-faint leading-relaxed px-4">
              I built this, nobody paid for it to be here, it is free and it does not want your email.
            </p>
            <p className="text-center text-[10px] text-ink-faint mt-2 leading-relaxed px-4">
              Educational tool only. Not financial or tax advice. Consider a licensed tax professional before making
              decisions based on this.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
