# The Do-Nothing Calculator audit, 2026-11-15

Audited `main` at `ba7d485`, live at https://do-nothing-calculator.vercel.app. Fixed on `audit-redesign`.

The calculator answers one question: what does selling and buying back in cost, against leaving your investments alone? The idea is sound. The live page made no request to any other site, stored nothing, and Lighthouse scored it 100 for performance and SEO.

The problems were in the money. Checked against primary sources as of 15 November 2026, there were **0 P0 and 4 P1 money issues**, out of 34 findings in total. None would cost a student money, because every error pointed the same way as the advice (leave it alone). But the headline figure was wrong in three ways at once, and the default assumed a bracket most students are not in.

- **The headline counted only one side's tax (MONEY-03).** It compared the holder's unsold account with the seller's after-tax account, then called the gap "a floor rather than a worst case". Holding defers tax; it does not erase it. At the live default the page said $17,292; what each would have in hand after selling differs by $12,513.
- **The model taxed the wrong gain (MONEY-02).** It grew at 7% after inflation and taxed only that real gain. The IRS taxes the whole dollar gain, inflation included, so the seller's tax was understated: at 22% the seller keeps $79,201, not $85,200.
- **It compounded too fast (MONEY-01).** 7%/12 a month compounds to 7.23% a year. $200 a month for 20 years showed $104,185 in the account instead of $101,507, and $500 a month for 40 years was $76,636 too high.
- **The default bracket was 22% (MONEY-04).** In 2026 that starts at $50,400 of taxable income, about $66,500 of pay. Most students are in 10% or 12%, and no bracket said what income it meant.
- **Smaller issues.**
  - The 7% label had no period or source (MONEY-05).
  - A sale at exactly a year was never explained (MONEY-07).
  - The tax year, filing status, kiddie tax and the taxes left out were never stated (SCOPE-01 to 03).
  - Seven accessibility failures, the worst being caption text at 2.6:1 contrast.

## Scoreboard

Scans: live on 2026-11-15 (`results/2026-11-15-live`) and a local production build of `audit-redesign` (`results/2026-11-15-local`), one Lighthouse run per page.

| Page | Perf | A11y | BP | SEO | LCP |
|---|---|---|---|---|---|
| First visit, mobile, live / after | 100 / 100 | 94 / 100 | 96 / 100 | 100 / 100 | 1850 / 758 ms |
| First visit, desktop, live / after | 100 / 100 | 94 / 100 | 96 / 100 | 100 / 100 | 423 / 209 ms |

Other measures, live then after:
- GEO 60 to 86
- Design engine 69 to 85
- Header check 40 to 80; meta validation 67 to 93
- Flow INP 89/49 ms to 66/50 ms
- Readable on slow 4G and 4x CPU: 2892 ms to 1431 ms
- First-load JS 104 kB
- Sideways scrolling: 0 of 10 screen and width pairs, both times
- The live security score (71) needs a deploy to remeasure; local plain HTTP cannot score it. A test checks the new headers.

Tests: 37 Playwright tests, all passing. The 15 money tests all fail on the live site.

## Hand-computed profiles

Expected values come from `tests/support/money-oracle.mjs`, which is written from the sources below and never from the app: it keeps every monthly purchase as its own tax lot. It agrees with the rebuilt `src/lib/simulate.ts` to within 1e-10 on 3,360 profiles, covering every bracket, frequency and horizon, five returns and eight amounts. All profiles use a 7% yearly return after inflation, in today's dollars.

| Profile | Live page showed | Cash in hand, after all tax | Never sell |
|---|---|---|---|
| First-year default: $200/mo, 12%, twice a year, 20 yrs | $9,887 gap (hold $104,185, sell $94,299) | **$8,731** (keep $97,266 vs $88,535; holder owes $4,241 on selling) | $12,972 |
| Summer job: $100/mo, 10%, every month, 10 yrs | $651 | **$878** | $884 |
| New grad: $500/mo, 22%, 4 times a year, 40 yrs | $449,508 | **$344,003** (holder owes $194,235) | $538,238 |
| Live default: $200/mo, 22%, twice a year, 20 yrs | $17,292 | **$12,513** (keep $91,714 vs $79,201; holder owes $9,793) | $22,306 |

Each error on its own, at the live default:
- Fixing the compounding takes the gap from $17,292 to $16,308.
- Taxing the dollar gain takes it to $22,306.
- Counting the holder's tax on selling brings it to $12,513.
- Stacking a year's gains matters only for large amounts ($450 on the new-grad profile).

One new case the rebuilt model can show: with no real growth, $10,000 a month, the 10% bracket and one sale a year, the holder's 15% at the end outweighs the seller's tax along the way, and selling comes out $799 ahead. The page says so in words.

## Issues

Sources were read on 2026-11-15. Severity:
- P0: a wrong number or advice that could cost money.
- P1: misleading but unlikely to cost money.
- P2: a bounded defect or a missing caveat.
- P3: polish.

### Money and claims

| ID | Sev | Finding | Status | Source |
|---|---|---|---|---|
| MONEY-01 | P1 | Compounds 7%/12 a month (7.23% a year). $200/mo for 20 yrs: $104,185 shown, $101,507 right; $500/mo for 40 yrs overstated by $76,636 | Fixed: (1 + r)^(1/12) - 1 | Annuity formula; closed-form check in the oracle |
| MONEY-02 | P1 | Taxes only the after-inflation gain while saying totals are in today's dollars; the IRS taxes the dollar gain. At 22% the seller keeps $79,201, not $85,200 | Fixed: runs in dollars with 3% inflation (CPI-U 1928-2025: 3.04% a year), reports in today's dollars | https://www.irs.gov/taxtopics/tc409, https://fred.stlouisfed.org/series/CPIAUCNS |
| MONEY-03 | P1 | Headline ignores the long-term tax the holder owes on selling and calls the gap "a floor rather than a worst case". Live default: $17,292 shown, $12,513 in hand | Fixed: headline, chart, cards and table are cash in hand after selling; the never-sell gap is shown under it. Which leads is Ben's call | https://www.irs.gov/pub/irs-drop/rp-25-32.pdf (section 4.03), https://www.irs.gov/taxtopics/tc409 |
| MONEY-04 | P1 | Default bracket 22%: starts at $50,400 taxable income in 2026 (about $66,500 of pay after the $16,100 standard deduction). Most students are in 10% or 12%. No bracket says what income it covers | Fixed: default 12%, the chosen bracket's 2026 range shown. Needs Ben's sign-off | https://www.irs.gov/pub/irs-drop/rp-25-32.pdf (Table 3), https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill |
| MONEY-05 | P2 | "7% is the S&P 500's long-run average after inflation": no period. The S&P 500 with dividends compounded 10.0% a year from 1928 to 2025, 6.8% after CPI-U | Fixed: "close to ... 6.8%, or about 10% before inflation. Past returns are not a promise." 7% kept, as Invest Ready does | https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html, https://fred.stlouisfed.org/series/CPIAUCNS |
| MONEY-06 | P3 | One flat rate on every gain; a year's gains stack and can cross into the next bracket | Fixed | https://www.irs.gov/pub/irs-drop/rp-25-32.pdf |
| MONEY-07 | P2 | "1x/yr": a sale exactly 12 months after buying is short-term ("one year or less"). The page never says that, or that holding more than a year is the cheap fix | Fixed: "Once a year", "every gain is short-term", and an "If you do sell" step | https://www.irs.gov/taxtopics/tc409 |
| SCOPE-01 | P2 | Brackets are 2026 single-filer; neither is stated | Fixed | https://www.irs.gov/pub/irs-drop/rp-25-32.pdf |
| SCOPE-02 | P2 | Dependent students under 24: investment income over $2,700 a year can be taxed at the parents' rate (kiddie tax) | Fixed: one line under the bracket | https://www.irs.gov/taxtopics/tc553, Rev. Proc. 2025-32 section 4.02 |
| SCOPE-03 | P2 | Federal only; state tax and the 3.8% NIIT left out silently | Fixed: stated | https://www.irs.gov/taxtopics/tc559 |
| SCOPE-04 | P3 | The seller pays tax out of each sale at once; really due with the return or estimated payments | Known, stated on the page | https://www.irs.gov/taxtopics/tc409 |
| SCOPE-05 | P3 | Brackets are indexed by chained CPI, a little below the 3% CPI-U the model uses | Known | https://www.irs.gov/pub/irs-drop/rp-25-32.pdf |

Checked and correct, kept:
- The seven 2026 rates.
- "Inside a Roth IRA or 401(k), selling does not trigger capital gains tax" (https://www.irs.gov/taxtopics/tc451).
- "No data stored. All calculations run locally": a full journey requests its own origin only and writes no storage or cookies.

### Accessibility

| ID | Sev | Finding | Status |
|---|---|---|---|
| A11Y-01 | P1 | Text under 4.5:1: #8CA98E captions and chart labels at 2.57:1, orange "Sell & rebuy" label at 2.24:1, green card label at 3.51:1 (Lighthouse a11y 94) | Fixed |
| A11Y-02 | P2 | No main landmark or footer | Fixed |
| A11Y-03 | P2 | Logo link named "Cense newsletter home" but showing "C Cense" (WCAG 2.5.3) | Fixed |
| A11Y-04 | P2 | Type under 13px: chart 9px, footnotes 10px, card labels 11px | Fixed |
| A11Y-05 | P2 | Tap targets under 40px: amount chips about 26px, pills 36px | Fixed |
| A11Y-06 | P2 | No reduced-motion rule | Fixed |
| A11Y-07 | P2 | Chart text alternative has no figures, and there is no table | Fixed |
| A11Y-08 | P3 | Pills were buttons with role="radio", so no arrow keys | Fixed: native radios |

### UX, design, performance

| ID | Sev | Finding | Status |
|---|---|---|---|
| UX-01 | P2 | framer-motion held content at opacity 0 until script ran: readable 2.9 s vs 1.5 s for real content, blank in background tabs | Fixed: CSS keyframes |
| UX-02 | P2 | The bracket moves the answer most but was hidden and never shown with the result | Fixed: stated under the headline, with "Change these" |
| UX-03 | P2 | Off the Cense system: Inter, all-caps labels, 9-11px type | Fixed |
| UX-04 | P3 | Axis could read "$1000K" | Fixed |
| UX-05 | P3 | No cap on the monthly amount | Fixed: $100,000, said on screen |
| PERF-01 | P3 | About 48 KiB unused framer-motion JS | Fixed; first-load JS 104 kB |
| DX-01 | P3 | No typecheck or test script, strict mode off, README listed Framer Motion | Fixed |

### Security and SEO

| ID | Sev | Finding | Status |
|---|---|---|---|
| SEC-01 | P2 | No CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy or Permissions-Policy (security 71, headers 27) | Fixed in `next.config.mjs`; live score needs a deploy |
| SEC-02 | P3 | Vercel sends `Access-Control-Allow-Origin: *` | Known: public page, no data; recheck after deploy |
| SEO-01 | P2 | No canonical or metadataBase; large Twitter card with no image | Fixed |
| SEO-02 | P2 | robots.txt and sitemap.xml return 404 | Fixed |
| SEO-03 | P2 | No structured data (GEO structured data 0 of 20) | Fixed: WebApplication JSON-LD |
| SEO-04 | P3 | /favicon.ico 404 logged a console error (best practices 96) | Fixed: icon.svg |

## Design

Direction: Loan Desk's quiet cream-and-green page with one loud thing. The signature element is the gap chart: two lines showing what each person would keep after tax if they sold that year, the space between them tinted orange, and a bracket at the right end measuring it with the same figure as the headline. Screenshots are kept on disk in `screenshots/` (not in git).

## Tests

`npm test` from `audits/` runs 37 Playwright tests against the production build on port 3205:
- money: four profiles, plus one test per money issue
- smoke
- axe at phone and desktop in three states
- the 13px and 40px floors, and reduced motion
- security headers, no third-party requests, no storage
- SEO basics

No known issues are left with tests: SCOPE-04 and SCOPE-05 are stated simplifications, and SEC-02 is live-only.

The helpers drive the page by the words a student sees, so the money tests also run against the live site: `AUDIT_URL=https://do-nothing-calculator.vercel.app npx playwright test money.spec.mjs`. All 15 fail there and pass on `audit-redesign`.

## Not verified

- The live security score and CORS header after a deploy.
- Screen readers by hand; axe and structure checks pass.
- The assumption that other income sits at the bottom of the chosen bracket. A student in the middle of the 12% bracket has less 0% long-term room than the model gives.
- State taxes, which the page says it leaves out.
