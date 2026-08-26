"use client";

import { cn } from "@/lib/utils";

interface NumberInputProps {
  id: string;
  label: string;
  helperText?: string;
  value: string;
  onChange: (displayValue: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function NumberInput({
  id,
  label,
  helperText,
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  className,
}: NumberInputProps) {
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {helperText && (
        <p id={`${id}-help`} className="text-xs text-ink-faint mt-0.5 leading-snug">
          {helperText}
        </p>
      )}
      <div className="relative mt-1.5">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={helperText ? `${id}-help` : undefined}
          className={cn(
            "w-full min-h-[44px] rounded-xl border border-line bg-white text-sm text-ink",
            "placeholder:text-ink-faint/60",
            "focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand",
            "transition-colors",
            prefix ? "pl-8 pr-3" : "px-3",
            suffix ? "pr-10" : ""
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
