# The Do-Nothing Calculator

**Live: [do-nothing-calculator.vercel.app](https://do-nothing-calculator.vercel.app)**

What does selling your investments and buying back in actually cost you? This models the tax
drag of moving money around, against the alternative of leaving it alone.

## Why it works this way

Nearly every finance tool is built to make you do something. The action bias is the product,
because doing something is what generates fees. This one is built to quantify the case for
inaction, which is usually the correct answer and is almost never the one being sold.

The assumptions panel is exposed rather than buried. The result depends heavily on holding
period, bracket, and expected return, and a single confident number without those levers
visible would be dishonest about how much it is really an estimate.

## The model

Two portfolios get the same amount at the end of every month and grow at the same steady rate.
One never sells. The other sells everything and buys back in a few times a year.

- **Today's dollars, taxed like the IRS taxes.** The return you enter is after inflation. The
  model adds 3% inflation (CPI-U averaged 3.04% a year from 1928 to 2025), so tax falls on the
  whole dollar gain, inflation included, and then reports everything back in today's dollars.
  The monthly amount rises with prices.
- **Compounding.** A yearly rate R grows each month by (1 + R)^(1/12) - 1, so 7% a year is 7%,
  not the 7.23% that R/12 compounds to.
- **2026 federal tax, single filer** (IRS Rev. Proc. 2025-32). Your other income is taken as
  the bottom of the bracket you pick; gains realized in one year stack on it.
- **Short and long term** (IRS Topic 409). Every sale by the seller is within a year, so it is
  short-term, taxed at your bracket. The headline compares what each walks away with after
  selling everything at the end: the holder's purchases held over a year pay 0%, 15% or 20%.
- Left out, and said so on the page: state tax, the 3.8% net investment income tax, market
  swings and losses, and the delay between a sale and the tax bill.

`src/lib/tax2026.ts` holds every tax figure with its source. `src/lib/simulate.ts` runs the two
portfolios. `audits/tests/support/money-oracle.mjs` is an independent version written from the
same sources, tracking each monthly purchase as its own tax lot, and the Playwright suite checks
the page against it.

## How it is built

- Next.js 14 App Router, TypeScript, Tailwind 3, on the Cense design system shared with
  Loan Desk and Decode (Bricolage Grotesque and Instrument Sans, cream, green and orange)
- Client side only: nothing is stored or sent, and the Content-Security-Policy keeps it that way

## Run it

```bash
npm install
npm run dev          # http://localhost:3205
```

Checks:

```bash
npm run lint
npm run typecheck
npm run build
cd audits && npm ci && npm run setup   # once
npm test                                # Playwright suite against the production build
node run.mjs --url http://localhost:3205/ --runs 1   # Lighthouse, security, GEO, design scans
```

The audit of 2026-11-15 is in [`audits/REPORT.md`](audits/REPORT.md).

Part of [Cense](https://cense.beehiiv.com).
