import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDollarInput(formatted: string): number {
  const digits = formatted.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function formatDollarInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

/** Axis labels: $0, $500, $28k, $1.25M. Rounds before choosing the unit, so $999,800 is $1M, not $1000k. */
export function formatCompact(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (Math.round(abs / 1000) >= 1000) {
    const m = abs / 1_000_000;
    return `${sign}$${m >= 10 ? m.toFixed(0) : m.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}M`;
  }
  if (Math.round(abs) >= 1000) {
    const k = abs / 1000;
    return `${sign}$${k >= 10 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
}

export function formatFull(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  return sign + "$" + Math.abs(rounded).toLocaleString("en-US");
}
