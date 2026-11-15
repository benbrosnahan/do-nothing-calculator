# Audit summary

- Target: http://localhost:3205/ (given with --url)
- Started: 2026-11-15T19:15:14.262Z
- Command: `node run.mjs --url http://localhost:3205/ --runs 1`
- Budgets: PASS: 17 passed, 0 failed

| Step | Result | Time |
|---|---|---|
| lighthouse | ok | 13.7 s |
| flow | ok | 96.5 s |
| security | ok | under 0.1 s |
| geo | ok | 10.6 s |
| design | ok | 32.8 s |
| ux | ok | under 0.1 s |
| tools | ok | 8.3 s |
| responsive | ok | 21.2 s |
| readable | ok | 4.2 s |

## Scoreboard

| Page | Perf | A11y | BP | SEO | LCP | FCP | CLS |
|---|---|---|---|---|---|---|---|
| First, mobile | 100 | 100 | 100 | 100 | 758 ms | 758 ms | 0 |
| First, desktop | 100 | 100 | 100 | 100 | 209 ms | 209 ms | 0 |

Median of 1 Lighthouse run per page, chosen by performance score. The one page is a first visit; the app stores nothing. TBT: first, mobile 13 ms, first, desktop 0 ms.

## Budgets

| Budget | Measured | Limit | Result |
|---|---|---|---|
| Performance, first, mobile | 100 | ≥ 90 | pass |
| Accessibility, first, mobile | 100 | ≥ 100 | pass |
| Best practices, first, mobile | 100 | ≥ 95 | pass |
| SEO, first, mobile | 100 | ≥ 100 | pass |
| LCP, first, mobile | 758 ms | ≤ 2500 ms | pass |
| FCP, first, mobile | 758 ms | ≤ 1800 ms | pass |
| CLS, first, mobile | 0 | ≤ 0.1 | pass |
| TBT, first, mobile | 13 ms | ≤ 200 ms | pass |
| Performance, first, desktop | 100 | ≥ 90 | pass |
| Accessibility, first, desktop | 100 | ≥ 100 | pass |
| Best practices, first, desktop | 100 | ≥ 95 | pass |
| SEO, first, desktop | 100 | ≥ 100 | pass |
| Flow INP (worst timespan), mobile | 66 ms (Open the assumptions) | ≤ 200 ms | pass |
| Flow INP (worst timespan), desktop | 50 ms (Open the assumptions) | ≤ 200 ms | pass |
| First-load JS, route / | 104.1 kB (6 files, gzip) | ≤ 130 kB | pass |
| GEO score (floor) | 86 | ≥ 60 | pass |
| Readable, first visit (floor) | 1431 ms (median of 1 cold load) | ≤ 3500 ms | pass |

Floors are not goals: they are the live site scores on 2026-11-15, before the audit fixes, so falling below one means something regressed.
The readable floor is a time, so going over it fails. It sits above measured times, because throttled loads on a shared machine are noisy: a regression guard, not a goal.

Targets, which never fail a run:

| Measure | Now | Target | Status |
|---|---|---|---|
| GEO score | 86 | 80 | met |
| Readable, first visit | 1431 ms | 1600 ms | met |

## User flow

Lighthouse user flow: first load, a monthly amount typed, the assumptions opened, and the tax bracket, how often you sell and the time horizon changed. Timespans measure INP, CLS and TBT; snapshots audit the state for accessibility, best practices and SEO.

### Mobile

| Step | Mode | Perf | A11y | BP | SEO | INP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| First load | navigation | 100 | 100 | 100 | 100 | – | 0 | 13 ms |
| Type a monthly amount | timespan | 100 | – | 100 | – | 22 ms | 0 | 0 ms |
| Result for $350 a month | snapshot | – | 100 | 100 | 100 | – | – | – |
| Open the assumptions | timespan | 100 | – | 100 | – | 66 ms | 0 | 0 ms |
| Change bracket, how often and horizon | timespan | 100 | – | 100 | – | 24 ms | 0 | 0 ms |
| Assumptions changed | snapshot | – | 100 | 100 | 100 | – | – | – |

Failing audits: Reduce unused JavaScript (First load); Network dependency tree (First load); Render-blocking requests (First load).

### Desktop

| Step | Mode | Perf | A11y | BP | SEO | INP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| First load | navigation | 100 | 100 | 100 | 100 | – | 0 | 0 ms |
| Type a monthly amount | timespan | 100 | – | 100 | – | 23 ms | 0 | 0 ms |
| Result for $350 a month | snapshot | – | 100 | 100 | 100 | – | – | – |
| Open the assumptions | timespan | 100 | – | 100 | – | 50 ms | 0 | 0 ms |
| Change bracket, how often and horizon | timespan | 100 | – | 100 | – | 24 ms | 0 | 0 ms |
| Assumptions changed | snapshot | – | 100 | 100 | 100 | – | – | – |

Failing audits: Network dependency tree (First load); Render-blocking requests (First load).


## Security

**35** of 100. HTTPS 0, headers 0, cookies 100, content 100, dependencies not measured.

Lighthouse-based checks: included, from the median mobile Lighthouse run of the first-visit page.

This target is plain HTTP, so TLS and every header read as missing whatever the server sends. Judge security with --target live.

- critical: Page not served over HTTPS
- critical: Missing Content-Security-Policy (0/10 points)
- critical: Missing Strict-Transport-Security (0/8 points)
- warning: Missing X-Content-Type-Options (0/4 points)
- warning: Missing X-Frame-Options (0/4 points)

## GEO

**86** of 100: crawl access 20/20, server content 30/30, structured data 16/20, social and meta 15/15, LLM discovery 0/10, indexability 5/5.

Words in the raw HTML: 475. Words once rendered: 475. Content parity 100%.

- warn: Rich Schema Types (4/8)

## Design

| State | Desktop | Mobile | Score | Grade | Accessibility | Consistency | Motion | Performance |
|---|---|---|---|---|---|---|---|---|
| result | 85 B | 85 B | 85 | B | 76 | 76 | 88 | 100 |
| assumptions | 85 B | 85 B | 85 | B | 76 | 76 | 88 | 100 |

Design engine 1.3.0. Score is the mean of the rounded desktop (1440x900) and mobile (375x812) scores; buckets are 0 to 100. The engine scores against Material 3 conventions and this app does not use Material, so a radius or target-size rule is advisory unless it is also a WCAG failure.

## UX deterministic

| Screen | Rule findings | P1 | P2 | P3 | Probe findings | Design |
|---|---|---|---|---|---|---|
| result-desktop | 5 | 0 | 5 | 0 | 0 | 85 |
| result-mobile | 5 | 0 | 5 | 0 | 0 | 85 |
| assumptions-desktop | 5 | 0 | 5 | 0 | 0 | 85 |
| assumptions-mobile | 5 | 0 | 5 | 0 | 0 | 85 |

Distinct findings, with how many screens show each:

- P2 1 animation/transition(s) under 50ms (non-instant but too fast to read). (4 screens)
- P2 1 to 2 border-radius value(s) off the 7-step scale (0/4/8/12/16/28/full). (4 screens)
- P2 Missing landmark(s): nav. (4 screens)
- P2 11 to 26 pointer target(s) smaller than M3's comfortable 48×48px at 1440px wide (2 screens)
- P2 17 to 20 reading-copy text node(s) below 16px (or any text below 11px). (4 screens)
- P2 11 to 26 tap target(s) smaller than M3's comfortable 48×48px at 375px wide (2 screens)

These are rule findings only. UX scores come from the AI review, which reads ux/<screen>.jpg and ux/<screen>.dom.json and writes ux/ai/<screen>.json; then `node lib/merge-ux.mjs <results>/ux` scores and merges them.

## Responsive overflow

| State | 320 | 375 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| result | ok, 2545 px | ok, 2319 px | ok, 1960 px | ok, 1960 px | ok, 1960 px |
| assumptions | ok, 3616 px | ok, 3250 px | ok, 2588 px | ok, 2588 px | ok, 2588 px |

0 of 10 pages scroll sideways. Each cell: horizontal overflow (document scrollWidth beyond the viewport), then page height. Full-page screenshots are in responsive/.

## INP probe

Not run.

## What a student sees and when

| Scenario | First paint | Real content | Readable | LCP (in page) |
|---|---|---|---|---|
| First visit | 1444 ms | 1431 ms | 1431 ms | 1884 ms |

One cold load per scenario, each in a fresh browser, on slow 4G and 4x CPU applied for real with devtools throttling, at 412x823 and DPR 1.75; ms from navigation start. First paint is Paint Timing's first-paint, the skeleton here. Real content is the first frame with an `h1` and no skeleton, readable the first frame where that `h1` and everything around it is fully opaque (CSS or script fades alike). FCP and the other marks are in readable.json.

Lighthouse's simulated LCP sees only the skeleton for this app (758 ms on the first-visit mobile page in this run), so the Scoreboard's LCP is not when a student can read anything: the Readable column is.

## Site tools

| Tool | Result |
|---|---|
| header-check | score 80: 8 good, 1 warnings, 1 missing |
| meta-validate | score 93: 14 good, 1 warnings, 0 missing |
| structured-data | 1 schemas, 0 errors, 1 warnings |
| sitemap-validate | found, 1 URLs, 1 issues |
| redirect-check | 0 redirects, final status 200: No redirects detected. URL resolves directly. |
| broken-links | 17 links, 0 broken, 0 redirects, 0 errors, 1 timeouts |
| webmcp-check | AI readiness 0 |

## Compared with results/2026-11-15-live

| Metric | Before | Now | Change |
|---|---|---|---|
| security.headers | 27 | 0 | -27 (worse) |
| security.https | 100 | 0 | -100 (worse) |
| security.score | 71 | 35 | -36 (worse) |
| ux.assumptions-desktop.p2 | 4 | 5 | +1 (worse) |
| ux.assumptions-mobile.p2 | 4 | 5 | +1 (worse) |
| ux.result-desktop.p2 | 4 | 5 | +1 (worse) |
| ux.result-mobile.p2 | 4 | 5 | +1 (worse) |
| design.assumptions.desktop | 69.3 | 85 | +15.7 (better) |
| design.assumptions.merged | 69 | 85 | +16 (better) |
| design.assumptions.mobile | 69.3 | 85 | +15.7 (better) |
| design.result.desktop | 69.3 | 85 | +15.7 (better) |
| design.result.merged | 69 | 85 | +16 (better) |
| design.result.mobile | 69.3 | 85 | +15.7 (better) |
| flow.desktop.assumptions-changed.accessibility | 94 | 100 | +6 (better) |
| flow.desktop.change-bracket-how-often-and-horizon.bestPractices | 95 | 100 | +5 (better) |
| flow.desktop.first-load.accessibility | 94 | 100 | +6 (better) |
| flow.desktop.first-load.bestPractices | 96 | 100 | +4 (better) |
| flow.desktop.open-the-assumptions.bestPractices | 95 | 100 | +5 (better) |
| flow.desktop.result-for-350-a-month.accessibility | 94 | 100 | +6 (better) |
| flow.desktop.type-a-monthly-amount.bestPractices | 95 | 100 | +5 (better) |
| flow.mobile.assumptions-changed.accessibility | 94 | 100 | +6 (better) |
| flow.mobile.change-bracket-how-often-and-horizon.bestPractices | 95 | 100 | +5 (better) |
| flow.mobile.first-load.accessibility | 94 | 100 | +6 (better) |
| flow.mobile.first-load.bestPractices | 96 | 100 | +4 (better) |
| flow.mobile.open-the-assumptions.bestPractices | 95 | 100 | +5 (better) |
| flow.mobile.result-for-350-a-month.accessibility | 94 | 100 | +6 (better) |
| flow.mobile.type-a-monthly-amount.bestPractices | 95 | 100 | +5 (better) |
| flow.mobile.type-a-monthly-amount.inp | 87.033 | 22.296 | -64.737 (better) |
| geo.score | 60 | 86 | +26 (better) |
| geo.serverContent | 28 | 30 | +2 (better) |
| geo.socialMeta | 7 | 15 | +8 (better) |
| geo.structuredData | 0 | 16 | +16 (better) |
| lighthouse.first-desktop.accessibility | 94 | 100 | +6 (better) |
| lighthouse.first-desktop.bestPractices | 96 | 100 | +4 (better) |
| lighthouse.first-desktop.lcp | 422.705 | 208.956 | -213.749 (better) |
| lighthouse.first-desktop.si | 305.03 | 208.956 | -96.074 (better) |
| lighthouse.first-desktop.tti | 422.705 | 208.956 | -213.749 (better) |
| lighthouse.first-mobile.accessibility | 94 | 100 | +6 (better) |
| lighthouse.first-mobile.bestPractices | 96 | 100 | +4 (better) |
| lighthouse.first-mobile.fcp | 851.117 | 758.024 | -93.093 (better) |
| lighthouse.first-mobile.lcp | 1850.117 | 758.024 | -1092.093 (better) |
| lighthouse.first-mobile.si | 1397.281 | 758.024 | -639.257 (better) |
| lighthouse.first-mobile.tti | 1850.117 | 1651.774 | -198.343 (better) |
| readable.first.lcp | 2528 | 1884 | -644 (better) |
| readable.first.readable | 2892 | 1431 | -1461 (better) |
| security.content | 80 | 100 | +20 (better) |
| tools.header-check.score | 40 | 80 | +40 (better) |
| tools.meta-validate.score | 67 | 93 | +26 (better) |
| tools.sitemap-validate.found | 0 | 1 | +1 (better) |
| tools.structured-data.totalSchemas | 0 | 1 | +1 (better) |
| ux.assumptions-desktop.extras | 1 | 0 | -1 (better) |
| ux.assumptions-desktop.findings | 6 | 5 | -1 (better) |
| ux.assumptions-desktop.p1 | 2 | 0 | -2 (better) |
| ux.assumptions-mobile.findings | 6 | 5 | -1 (better) |
| ux.assumptions-mobile.p1 | 2 | 0 | -2 (better) |
| ux.result-desktop.extras | 1 | 0 | -1 (better) |
| ux.result-desktop.findings | 6 | 5 | -1 (better) |
| ux.result-desktop.p1 | 2 | 0 | -2 (better) |
| ux.result-mobile.findings | 6 | 5 | -1 (better) |
| ux.result-mobile.p1 | 2 | 0 | -2 (better) |

Timings within 50 ms or 10%, and CLS within 0.01, count as unchanged. 0 metrics exist only in the stored run and 1 only in this one (steps not run in both).
