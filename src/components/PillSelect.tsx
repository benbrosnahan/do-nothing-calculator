"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface PillSelectProps<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Shown under the pills and read with the group. */
  help?: React.ReactNode;
}

/**
 * A row of pills that is a real radio group: native inputs, so arrow keys move the choice and screen readers
 * announce "1 of 4". Each pill is at least 40px tall.
 */
export default function PillSelect<T extends string | number>({ label, options, value, onChange, help }: PillSelectProps<T>) {
  const name = useId();
  const helpId = `${name}-help`;
  return (
    <fieldset aria-describedby={help ? helpId : undefined}>
      <legend className="text-base font-semibold text-slate-900">{label}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={String(opt.value)} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={String(opt.value)}
              checked={opt.value === value}
              onChange={() => onChange(opt.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "tnum inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-semibold transition-colors",
                "border-slate-300 bg-white text-slate-800 hover:border-navy hover:bg-slate-100",
                "peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-navy peer-focus-visible:ring-offset-2"
              )}
            >
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      {help && (
        <div id={helpId} className="mt-2.5 text-sm leading-relaxed text-slate-600">
          {help}
        </div>
      )}
    </fieldset>
  );
}
