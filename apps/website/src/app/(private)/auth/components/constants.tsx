import type { CSSProperties } from "react";

export const AUTH_BG = {
  dark: "/images/login_bg_dark.png",
  light: "/images/login_bg_light.png",
};

/** Resend cooldown applied after a successful OTP send. */
export const RESEND_COOLDOWN_SECONDS = 30;

/** Length of the OTP we ship. The backend sends a 6-digit code today. */
export const OTP_LENGTH = 6;

/** Phone digits validation (Indian numbers — 10 digits after country code). */
export const PHONE_DIGITS = 10;

/**
 * `theme-dark-only` / `theme-light-only` set `display: var(--theme-dark-display, inline-block)`
 * in globals.css, which overrides Tailwind's `flex`/`inline-flex`. These inline styles
 * set the variable per-element so the active theme renders the correct display.
 */
export const INLINE_FLEX_THEME_VAR = {
  "--theme-dark-display": "inline-flex",
} as CSSProperties;

export const FLEX_THEME_VAR = {
  "--theme-dark-display": "flex",
} as CSSProperties;

/** Human-readable phone — "+918888888888" → "+91 88888 88888". Falls back to input as-is. */
export function formatPhoneDisplay(phone: string): string {
  const trimmed = phone.trim();
  if (/^\+91\d{10}$/.test(trimmed)) {
    const local = trimmed.slice(3);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return trimmed;
}

/** Sanitize a free-form phone field down to digits with leading zeros stripped. */
export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+/, "").slice(0, PHONE_DIGITS);
}

export function toE164(digits: string): string {
  return `+91${digits}`;
}

/** Validate `safeNext` URLs from query string — must be a same-origin path. */
export function pickSafeNext(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  return v.startsWith("/") && !v.startsWith("//") ? v : "";
}
