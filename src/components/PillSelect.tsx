"use client";

import { cn } from "@/lib/utils";

interface PillSelectProps<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export default function PillSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: PillSelectProps<T>) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "min-h-[36px] px-3.5 rounded-full border text-xs font-semibold transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-ink-muted hover:border-brand-border"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
