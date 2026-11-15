# Audit summary

- Target: https://do-nothing-calculator.vercel.app/ (given with --url)
- Started: 2026-11-15T18:46:41.003Z
- Command: `node run.mjs --url https://do-nothing-calculator.vercel.app/ --runs 1`
- Budgets: FAIL: 15 passed, 2 failed

| Step | Result | Time |
|---|---|---|
| lighthouse | ok | 15.5 s |
| flow | ok | 98 s |
| security | ok | 0.1 s |
| geo | ok | 11.2 s |
| design | ok | 32.8 s |
| ux | ok | under 0.1 s |
| tools | ok | 1.3 s |
| responsive | ok | 22.9 s |
| readable | ok | 4.6 s |

## Scoreboard

| Page | Perf | A11y | BP | SEO | LCP | FCP | CLS |
|---|---|---|---|---|---|---|---|
| First, mobile | 100 | 94 | 96 | 100 | 1850 ms | 851 ms | 0 |
| First, desktop | 100 | 94 | 96 | 100 | 423 ms | 230 ms | 0 |

Median of 1 Lighthouse run per page, chosen by performance score. The one page is a first visit; the app stores nothing. TBT: first, mobile 55 ms, first, desktop 0 ms.

## Budgets

| Budget | Measured | Limit | Result |
|---|---|---|---|
| Performance, first, mobile | 100 | ≥ 90 | pass |
| Accessibility, first, mobile | 94 | ≥ 100 | **FAIL** |
| Best practices, first, mobile | 96 | ≥ 95 | pass |
| SEO, first, mobile | 100 | ≥ 100 | pass |
| LCP, first, mobile | 1850 ms | ≤ 2500 ms | pass |
| FCP, first, mobile | 851 ms | ≤ 1800 ms | pass |
| CLS, first, mobile | 0 | ≤ 0.1 | pass |
| TBT, first, mobile | 55 ms | ≤ 200 ms | pass |
| Performance, first, desktop | 100 | ≥ 90 | pass |
| Accessibility, first, desktop | 94 | ≥ 100 | **FAIL** |
| Best practices, first, desktop | 96 | ≥ 95 | pass |
| SEO, first, desktop | 100 | ≥ 100 | pass |
| Flow INP (worst timespan), mobile | 89 ms (Open the assumptions) | ≤ 200 ms | pass |
| Flow INP (worst timespan), desktop | 49 ms (Open the assumptions) | ≤ 200 ms | pass |
| Security score, live (floor) | 71 | ≥ 71 | pass |
| GEO score (floor) | 60 | ≥ 44 | pass |
| Readable, first visit (floor) | 2892 ms (median of 1 cold load) | ≤ 3500 ms | pass |

First-load JS is read from the local build, so it is checked only when the target is served from this machine.
Floors are not goals: they are the scores measured on 2026-11-02, so falling below one means something regressed.
The readable floor is a time, so going over it fails. It sits well above the times measured on 2026-11-02, because throttled loads on a shared machine are noisy: a regression guard, not a goal.

Targets, which never fail a run:

| Measure | Now | Target | Status |
|---|---|---|---|
| Security score, live | 71 | 90 | 19 to go |
| GEO score | 60 | 80 | 20 to go |
| Readable, first visit | 2892 ms | 1600 ms | 1292 ms to go |

## User flow

Lighthouse user flow: first load, a monthly amount typed, the assumptions opened, and the tax bracket, how often you sell and the time horizon changed. Timespans measure INP, CLS and TBT; snapshots audit the state for accessibility, best practices and SEO.

### Mobile

| Step | Mode | Perf | A11y | BP | SEO | INP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| First load | navigation | 100 | 94 | 96 | 100 | – | 0 | 36 ms |
| Type a monthly amount | timespan | 100 | – | 95 | – | 87 ms | 0 | 34 ms |
| Result for $350 a month | snapshot | – | 94 | 100 | 100 | – | – | – |
| Open the assumptions | timespan | 100 | – | 95 | – | 89 ms | 0 | 0 ms |
| Change bracket, how often and horizon | timespan | 100 | – | 95 | – | 50 ms | 0 | 0 ms |
| Assumptions changed | snapshot | – | 94 | 100 | 100 | – | – | – |

Failing audits: Browser errors were logged to the console (First load); Background and foreground colors do not have a sufficient contrast ratio. (First load); Elements with visible text labels do not have matching accessible names. (First load); Document does not have a main landmark. (First load); Reduce unused JavaScript (First load); Legacy JavaScript (First load); Network dependency tree (First load); Browser errors were logged to the console (Type a monthly amount); 8 more.

### Desktop

| Step | Mode | Perf | A11y | BP | SEO | INP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| First load | navigation | 100 | 94 | 96 | 100 | – | 0 | 0 ms |
| Type a monthly amount | timespan | 100 | – | 95 | – | 21 ms | 0 | 0 ms |
| Result for $350 a month | snapshot | – | 94 | 100 | 100 | – | – | – |
| Open the assumptions | timespan | 100 | – | 95 | – | 49 ms | 0 | 0 ms |
| Change bracket, how often and horizon | timespan | 100 | – | 95 | – | 23 ms | 0 | 0 ms |
| Assumptions changed | snapshot | – | 94 | 100 | 100 | – | – | – |

Failing audits: Browser errors were logged to the console (First load); Background and foreground colors do not have a sufficient contrast ratio. (First load); Elements with visible text labels do not have matching accessible names. (First load); Document does not have a main landmark. (First load); Reduce unused JavaScript (First load); Legacy JavaScript (First load); Network dependency tree (First load); Browser errors were logged to the console (Type a monthly amount); 8 more.


## Security

**71** of 100. HTTPS 100, headers 27, cookies 100, content 80, dependencies not measured.

Lighthouse-based checks: included, from the median mobile Lighthouse run of the first-visit page.

- critical: Missing Content-Security-Policy (0/10 points)
- warning: Missing X-Content-Type-Options (0/4 points)
- warning: Missing X-Frame-Options (0/4 points)
- warning: CORS allows all origins

## GEO

**60** of 100: crawl access 20/20, server content 28/30, structured data 0/20, social and meta 7/15, LLM discovery 0/10, indexability 5/5.

Words in the raw HTML: 205. Words once rendered: 205. Content parity 100%.

- warn: Heading Hierarchy (1/3)
- fail: JSON-LD in SSR (0/12)
- fail: Rich Schema Types (0/8)
- warn: Open Graph Tags (3/7)
- warn: Canonical URL (0/4)

High-priority recommendations: Add JSON-LD structured data.

## Design

| State | Desktop | Mobile | Score | Grade | Accessibility | Consistency | Motion | Performance |
|---|---|---|---|---|---|---|---|---|
| result | 69.3 D | 69.3 D | 69 | D | 42 | 76 | 66 | 100 |
| assumptions | 69.3 D | 69.3 D | 69 | D | 42 | 76 | 66 | 100 |

Design engine 1.3.0. Score is the mean of the rounded desktop (1440x900) and mobile (375x812) scores; buckets are 0 to 100. The engine scores against Material 3 conventions and this app does not use Material, so a radius or target-size rule is advisory unless it is also a WCAG failure.

## UX deterministic

| Screen | Rule findings | P1 | P2 | P3 | Probe findings | Design |
|---|---|---|---|---|---|---|
| result-desktop | 6 | 2 | 4 | 0 | 1 | 69.3 |
| result-mobile | 6 | 2 | 4 | 0 | 0 | 69.3 |
| assumptions-desktop | 6 | 2 | 4 | 0 | 1 | 69.3 |
| assumptions-mobile | 6 | 2 | 4 | 0 | 0 | 69.3 |

Distinct findings, with how many screens show each:

- P1 No @media (prefers-reduced-motion: reduce) rule found (4 screens)
- P1 10 to 13 text node(s) below WCAG contrast (4.5:1 normal / 3:1 large). (4 screens)
- P2 9 distinct text colors (4 screens)
- P2 Missing landmark(s): main, nav, contentinfo. (4 screens)
- P2 4 to 20 pointer target(s) smaller than M3's comfortable 48×48px at 1440px wide (2 screens)
- P2 7 to 10 reading-copy text node(s) below 16px (or any text below 11px). (4 screens)
- P2 4 to 20 tap target(s) smaller than M3's comfortable 48×48px at 375px wide (2 screens)
- P3 Primary controls show no hover feedback (2 screens)

These are rule findings only. UX scores come from the AI review, which reads ux/<screen>.jpg and ux/<screen>.dom.json and writes ux/ai/<screen>.json; then `node lib/merge-ux.mjs <results>/ux` scores and merges them.

## Responsive overflow

| State | 320 | 375 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| result | ok, 1426 px | ok, 1309 px | ok, 1254 px | ok, 1254 px | ok, 1254 px |
| assumptions | ok, 2011 px | ok, 1761 px | ok, 1646 px | ok, 1646 px | ok, 1646 px |

0 of 10 pages scroll sideways. Each cell: horizontal overflow (document scrollWidth beyond the viewport), then page height. Full-page screenshots are in responsive/.

## INP probe

Not run.

## What a student sees and when

| Scenario | First paint | Real content | Readable | LCP (in page) |
|---|---|---|---|---|
| First visit | 1500 ms | 1486 ms | 2892 ms | 2528 ms |

One cold load per scenario, each in a fresh browser, on slow 4G and 4x CPU applied for real with devtools throttling, at 412x823 and DPR 1.75; ms from navigation start. First paint is Paint Timing's first-paint, the skeleton here. Real content is the first frame with an `h1` and no skeleton, readable the first frame where that `h1` and everything around it is fully opaque (CSS or script fades alike). FCP and the other marks are in readable.json.

Lighthouse's simulated LCP sees only the skeleton for this app (1850 ms on the first-visit mobile page in this run), so the Scoreboard's LCP is not when a student can read anything: the Readable column is.

## Site tools

| Tool | Result |
|---|---|
| header-check | score 40: 4 good, 1 warnings, 5 missing |
| meta-validate | score 67: 10 good, 3 warnings, 2 missing |
| structured-data | 0 schemas, 0 errors, 0 warnings |
| sitemap-validate | not found (Sitemap not found at https://do-nothing-calculator.vercel.app/sitemap.xml. HTTP 404) |
| redirect-check | 0 redirects, final status 200: No redirects detected. URL resolves directly. |
| broken-links | 10 links, 0 broken, 0 redirects, 0 errors, 0 timeouts |
| webmcp-check | AI readiness 0 |
