"use client";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-page/95 backdrop-blur border-b border-line">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a
            href="https://cense.beehiiv.com"
            className="flex items-center gap-2 rounded-lg hover:opacity-75 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label="Cense newsletter home"
          >
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="font-semibold text-ink">Cense</span>
          </a>
          <span className="text-ink-faint">/</span>
          <span className="text-ink-muted text-sm">Do-Nothing Calculator</span>
        </div>
        <span className="text-xs text-ink-faint hidden sm:block">
          No data stored. All calculations run locally.
        </span>
      </div>
    </header>
  );
}
