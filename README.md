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

## How it is built

- Next.js App Router, TypeScript, Tailwind, Framer Motion
- `src/lib/simulate.ts` runs the two scenarios forward and diffs them
- Client side only, nothing stored

## Run it

```bash
npm install
npm run dev
```

Built with Claude Code. Part of [Cense](https://cense.beehiiv.com).
