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

export function formatCompact(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return sign + "$" + (abs / 1_000_000).toFixed(2) + "M";
  }
  if (abs >= 1_000) {
    return sign + "$" + (abs / 1_000).toFixed(0) + "K";
  }
  return sign + "$" + Math.round(abs).toLocaleString("en-US");
}

export function formatFull(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.round(Math.abs(n)).toLocaleString("en-US");
}
