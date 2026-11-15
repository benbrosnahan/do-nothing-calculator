"use client";

import { useMemo, useRef, useState } from "react";
import Nav, { PrivacyBadge } from "@/components/Nav";
import AssumptionsPanel from "@/components/AssumptionsPanel";
import GrowthChart from "@/components/GrowthChart";
import { DEFAULT_INPUTS, MAX_MONTHLY, QUICK_CONTRIBUTIONS, REBALANCE_OPTIONS, simulate } from "@/lib/simulate";
import { bracketInfo } from "@/lib/tax2026";
import { cn, formatDollarInput, formatFull, parseDollarInput } from "@/lib/utils";

const pct = (r: number) => `${Math.round(r * 100)}%`;
const trimPct = (n: number) => String(Number(n.toFixed(2)));

function LegendLine({ dashed, color }: { dashed?: boolean; color: string }) {
  return (
    <svg aria-hidden width="28" height="10" className="flex-shrink-0">
      <line
        x1="2"
        y1="5"
        x2="26"
        y2="5"
        stroke={color}
        strokeWidth={dashed ? 2.5 : 3}
        strokeDasharray={dashed ? "6 5" : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  const [contributionRaw, setContributionRaw] = useState(formatDollarInput(String(DEFAULT_INPUTS.monthlyContribution)));
  const [returnPct, setReturnPct] = useState(trimPct(DEFAULT_INPUTS.annualReturn * 100));
  const [taxRate, setTaxRate] = useState(DEFAULT_INPUTS.taxRate);
  const [rebalancesPerYear, setRebalancesPerYear] = useState(DEFAULT_INPUTS.rebalancesPerYear);
  const [years, setYears] = useState(DEFAULT_INPUTS.years);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const assumptionsRef = useRef<HTMLDivElement>(null);

  const monthlyContribution = Math.min(MAX_MONTHLY, parseDollarInput(contributionRaw));
  const capped = parseDollarInput(contributionRaw) > MAX_MONTHLY;
  const returnPctClamped = Math.max(0, Math.min(30, Number(returnPct) || 0));
  const annualReturn = returnPctClamped / 100;

  const result = useMemo(
    () => simulate({ monthlyContribution, annualReturn, taxRate, rebalancesPerYear, years }),
    [monthlyContribution, annualReturn, taxRate, rebalancesPerYear, years]
  );

  const hasMoney = monthlyContribution > 0;
  const often = REBALANCE_OPTIONS.find((o) => o.value === rebalancesPerYear)?.phrase ?? "a few times a year";
  const longTermRate = bracketInfo(taxRate).longTermRate;
  const gapRounded = Math.round(result.gap);
  const holderAhead = gapRounded > 0;
  const sellerAhead = gapRounded < 0;

  const openAssumptions = () => {
    setAssumptionsOpen(true);
    requestAnimationFrame(() => assumptionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const summary = holderAhead
    ? `After ${years} years, if each sold everything, leaving it alone keeps ${formatFull(result.holdKeep)} and selling and rebuying ${often} keeps ${formatFull(result.activeKeep)}, a gap of ${formatFull(result.gap)}.`
    : `After ${years} years, if each sold everything, leaving it alone keeps ${formatFull(result.holdKeep)} and selling and rebuying ${often} keeps ${formatFull(result.activeKeep)}.`;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Nav />

      <main id="main" className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <section className="rise pt-8 sm:pt-14">
          <h2 className="text-balance font-display text-[2.3rem] font-bold leading-[1.04] tracking-tight text-slate-900 sm:text-6xl">
            What selling and buying back in costs you.
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-slate-700">
            Two people put in the same amount every month. One leaves it alone. The other sells everything and buys
            back in a few times a year, and pays tax on the gains each time.
          </p>
          <PrivacyBadge className="mt-4 sm:hidden" />
        </section>

        <section className="mt-8" aria-label="Your monthly amount">
          <label htmlFor="monthly" className="block text-base font-semibold text-slate-900">
            You put in each month
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="relative w-[7.5rem] sm:w-40">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-600">
                $
              </span>
              <input
                id="monthly"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={contributionRaw}
                onChange={(e) => setContributionRaw(formatDollarInput(e.target.value))}
                placeholder="200"
                aria-describedby={capped ? "monthly-cap" : undefined}
                className={cn(
                  "tnum min-h-[52px] w-full rounded-2xl border border-slate-300 bg-white pl-8 pr-4 text-lg font-semibold text-slate-900",
                  "placeholder:font-normal placeholder:text-slate-600",
                  "transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy"
                )}
              />
            </div>
            {QUICK_CONTRIBUTIONS.map((amt) => (
              <button
                key={amt}
                type="button"
                aria-pressed={monthlyContribution === amt}
                onClick={() => setContributionRaw(formatDollarInput(String(amt)))}
                className={cn(
                  "tnum min-h-[44px] rounded-full border px-3.5 text-sm font-semibold transition-colors sm:px-4",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2",
                  monthlyContribution === amt
                    ? "border-navy bg-navy text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:border-navy hover:bg-slate-100"
                )}
              >
                ${amt}
              </button>
            ))}
          </div>
          {capped && (
            <p id="monthly-cap" className="mt-2 text-sm text-slate-600">
              Worked out at the most this takes: {formatFull(MAX_MONTHLY)} a month.
            </p>
          )}
        </section>

        {hasMoney ? (
          <section aria-labelledby="answer-figure" className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-card sm:p-8">
            <div aria-live="polite">
              <p className="text-base leading-relaxed text-slate-700">
                {sellerAhead
                  ? `After ${years} years, selling and rebuying ${often} gives you`
                  : holderAhead
                    ? `After ${years} years, leaving it alone gives you`
                    : `After ${years} years, the two come out`}
              </p>
              <p id="answer-figure" className="figure mt-1 text-[3.4rem] font-extrabold leading-none text-slate-900 sm:text-7xl">
                {holderAhead || sellerAhead ? formatFull(Math.abs(result.gap)) : "About even"}
              </p>
              <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-slate-700">
                {holderAhead && (
                  <>
                    more than selling and rebuying {often}
                    {result.gapPct >= 0.005 ? ` (${Math.round(result.gapPct * 100)}% more)` : ""}. That is after all
                    tax, in today&apos;s dollars.
                  </>
                )}
                {sellerAhead && (
                  <>
                    more than leaving it alone. Here the tax the holder owes when selling at the end is more than the
                    seller paid along the way.
                  </>
                )}
                {!holderAhead && !sellerAhead && <>after tax, in today&apos;s dollars.</>}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              At the {pct(taxRate)} tax bracket and a {trimPct(returnPctClamped)}% yearly return.{" "}
              <button
                type="button"
                onClick={openAssumptions}
                className="rounded font-semibold text-slate-900 underline underline-offset-2 hover:text-navy-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                Change these
              </button>
            </p>

            <div className="mt-7">
              <p className="text-sm font-semibold text-slate-900">If each sold everything that year, after tax</p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-800">
                <li className="flex items-center gap-2">
                  <LegendLine color="#26602D" />
                  Leave it alone
                </li>
                <li className="flex items-center gap-2">
                  <LegendLine color="#C1652E" dashed />
                  Sell and rebuy {often}
                </li>
              </ul>
              <div className="mt-3">
                <GrowthChart points={result.points} years={years} summary={summary} />
              </div>
            </div>

            <dl className="mt-6 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-slate-900">Leave it alone</dt>
                <dd className="mt-1 text-base text-slate-800">
                  You keep{" "}
                  <strong className="tnum font-display text-2xl font-bold text-slate-900">{formatFull(result.holdKeep)}</strong>
                </dd>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                  <span className="tnum">{formatFull(result.holdValue)}</span> in the account, less{" "}
                  <span className="tnum">{formatFull(result.holdTaxOnSale)}</span> tax when you sell.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-accent-hover">Sell and rebuy</dt>
                <dd className="mt-1 text-base text-slate-800">
                  You keep{" "}
                  <strong className="tnum font-display text-2xl font-bold text-slate-900">{formatFull(result.activeKeep)}</strong>
                </dd>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                  Paid <span className="tnum">{formatFull(result.taxPaidAlongTheWay)}</span> in tax along the way.
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              Never sell at all, and the holder never pays that last tax: the gap is{" "}
              <span className="tnum font-semibold text-slate-900">{formatFull(result.gapIfNeverSold)}</span>.
            </p>
          </section>
        ) : (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-base text-slate-700">Type a monthly amount to see the two lines.</p>
          </section>
        )}

        <section aria-labelledby="next-step" className="mt-6 rounded-3xl border border-brand-border bg-brand-light p-5 sm:p-6">
          <h2 id="next-step" className="font-display text-xl font-bold text-slate-900">
            If you do sell
          </h2>
          <p className="mt-2 text-base leading-relaxed text-slate-800">
            Hold it for more than a year first. Gains on anything held that long are taxed at 0%, 15% or 20%, not at
            your bracket.{" "}
            {longTermRate === 0
              ? "At yours, that can be 0%."
              : longTermRate === 0.15
                ? "At yours, that is usually 15%."
                : "At yours, that is 20%."}{" "}
            In a Roth IRA or 401(k), selling is not taxed at all.
          </p>
        </section>

        <div ref={assumptionsRef} className="mt-6 scroll-mt-4">
          <AssumptionsPanel
            open={assumptionsOpen}
            onToggle={() => setAssumptionsOpen((v) => !v)}
            returnPct={returnPct}
            onReturnPctChange={setReturnPct}
            onReturnPctBlur={() => setReturnPct(trimPct(returnPctClamped))}
            taxRate={taxRate}
            onTaxRateChange={setTaxRate}
            rebalancesPerYear={rebalancesPerYear}
            onRebalancesChange={setRebalancesPerYear}
            years={years}
            onYearsChange={setYears}
          />
        </div>

        {hasMoney && (
          <details className="group mt-3 rounded-3xl border border-line bg-white shadow-card">
            <summary className="flex min-h-[56px] cursor-pointer items-center justify-between gap-3 rounded-3xl px-5 text-base font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 sm:px-6">
              See it year by year
              <svg aria-hidden className="h-5 w-5 flex-shrink-0 text-slate-700 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="overflow-x-auto border-t border-line px-2 pb-3 sm:px-4">
              <table className="tnum w-full text-left text-sm">
                <caption className="px-3 pb-1 pt-4 text-left text-sm leading-relaxed text-slate-600">
                  What each keeps if they sell everything at the end of that year, after tax, in today&apos;s dollars.
                </caption>
                <thead>
                  <tr className="text-slate-700">
                    <th scope="col" className="px-3 py-2.5 font-semibold">Year</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Leave it alone</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Sell and rebuy</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {result.points.slice(1).map((p) => (
                    <tr key={p.year} className="border-t border-line">
                      <th scope="row" className="px-3 py-2 font-normal text-slate-800">{p.year}</th>
                      <td className="px-3 py-2 text-right text-slate-900">{formatFull(p.holdKeep)}</td>
                      <td className="px-3 py-2 text-right text-slate-900">{formatFull(p.activeKeep)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatFull(p.holdKeep - p.activeKeep)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <details className="group mt-3 rounded-3xl border border-line bg-white shadow-card">
          <summary className="flex min-h-[56px] cursor-pointer items-center justify-between gap-3 rounded-3xl px-5 text-base font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 sm:px-6">
            How this is worked out
            <svg aria-hidden className="h-5 w-5 flex-shrink-0 text-slate-700 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="border-t border-line px-5 pb-6 pt-4 text-sm leading-relaxed text-slate-700 sm:px-6">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Both grow at the same steady return every month, with no ups and downs. Real markets swing, and a sale
                at a loss changes the math.
              </li>
              <li>
                Everything is in today&apos;s dollars. Prices are assumed to rise 3% a year, close to the 1928 to 2025
                average, and your monthly amount rises with them.
              </li>
              <li>
                Tax is on the whole dollar gain, inflation included, because that is how the IRS charges it.
              </li>
              <li>
                2026 federal brackets for a single filer. Your other income is taken as the bottom of the bracket you
                pick, and gains are added on top, so a large gain can reach the next bracket.
              </li>
              <li>
                The seller pays tax out of each sale right away. In real life it is due with your tax return.
              </li>
              <li>
                Selling at the end, anything held more than a year is taxed at 0%, 15% or 20%, and the rest at your
                bracket.
              </li>
              <li>
                Federal tax only. State tax, and the 3.8% tax on investment income over $200,000, are left out.
              </li>
            </ul>
            <p className="mt-4 text-slate-600">
              Sources:{" "}
              <a className="font-semibold text-slate-900 underline underline-offset-2" href="https://www.irs.gov/pub/irs-drop/rp-25-32.pdf">
                IRS Rev. Proc. 2025-32
              </a>{" "}
              (2026 brackets and long-term rates),{" "}
              <a className="font-semibold text-slate-900 underline underline-offset-2" href="https://www.irs.gov/taxtopics/tc409">
                IRS Topic 409
              </a>{" "}
              (short and long term),{" "}
              <a
                className="font-semibold text-slate-900 underline underline-offset-2"
                href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html"
              >
                S&amp;P 500 returns, 1928 to 2025
              </a>{" "}
              and{" "}
              <a className="font-semibold text-slate-900 underline underline-offset-2" href="https://fred.stlouisfed.org/series/CPIAUCNS">
                consumer prices
              </a>
              .
            </p>
          </div>
        </details>

        <footer className="mt-14 border-t border-line pt-6">
          <p className="text-sm font-semibold leading-relaxed text-slate-800">
            Nothing you type is saved or sent anywhere. The math runs in your browser.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            An estimate to learn from, not tax or investment advice. Your real tax depends on things this does not
            know, like your state and the rest of your income.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            I built this, nobody paid for it to be here, it is free and it does not want your email. Built by{" "}
            <a
              href="https://cense.beehiiv.com"
              className="font-semibold text-slate-900 underline underline-offset-2 hover:text-navy-hover"
            >
              Cense
            </a>
            , a free weekly personal finance newsletter for people who did not get taught this.
          </p>
        </footer>
      </main>
    </>
  );
}
