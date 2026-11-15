// The page header: the Cense mark, the tool's name, and the privacy promise. Same pattern as Loan Desk and Decode.

import { cn } from "@/lib/utils";

function ShieldIcon() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    </svg>
  );
}

export function PrivacyBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-slate-800",
        className
      )}
    >
      <ShieldIcon />
      Nothing stored
    </span>
  );
}

export default function Nav() {
  return (
    <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pt-5 sm:px-6 sm:pt-7">
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        {/* accent-hover, not accent: #C1652E on the page is under 4.5:1 at this size. #A8531F clears it. */}
        <a
          href="https://cense.beehiiv.com"
          className="rounded font-display text-lg font-bold text-accent-hover hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 sm:text-xl"
        >
          Cense<span className="sr-only"> newsletter</span>
        </a>
        <h1 className="whitespace-nowrap font-display text-lg font-bold text-slate-900 sm:text-xl">The Do-Nothing Calculator</h1>
      </div>
      {/* On a phone the name needs the whole row, so the badge moves under the introduction. */}
      <PrivacyBadge className="hidden sm:inline-flex" />
    </header>
  );
}
