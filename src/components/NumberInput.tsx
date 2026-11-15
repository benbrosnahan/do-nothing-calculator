"use client";

import { cn } from "@/lib/utils";

interface NumberInputProps {
  id: string;
  label: string;
  helperText?: React.ReactNode;
  value: string;
  onChange: (displayValue: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** A number field. 16px text, because iOS Safari zooms the page on focus for anything smaller. */
export default function NumberInput({
  id,
  label,
  helperText,
  value,
  onChange,
  onBlur,
  placeholder,
  prefix,
  suffix,
  className,
}: NumberInputProps) {
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="block text-base font-semibold text-slate-900">
        {label}
      </label>
      <div className="relative mt-2 max-w-[11rem]">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-600">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-describedby={helperText ? `${id}-help` : undefined}
          className={cn(
            "tnum min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white text-base font-semibold text-slate-900",
            "placeholder:font-normal placeholder:text-slate-600",
            "transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy",
            prefix ? "pl-8 pr-4" : "px-4",
            suffix && "pr-10"
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base text-slate-600">
            {suffix}
          </span>
        )}
      </div>
      {helperText && (
        <p id={`${id}-help`} className="mt-2.5 text-sm leading-relaxed text-slate-600">
          {helperText}
        </p>
      )}
    </div>
  );
}
