import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an INR amount. Uses Indian numbering for sub-lakh, then collapses
 * to "Lakh" / "Cr" with a non-breaking space so the unit stays on the same
 * line as the number.
 */
export function formatINR(n: number): string {
  const nbsp = "\u00A0";
  if (!Number.isFinite(n)) return "—";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}${nbsp}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}${nbsp}Lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Compact integer formatter with Indian grouping. */
export function formatIntIn(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-IN");
}
