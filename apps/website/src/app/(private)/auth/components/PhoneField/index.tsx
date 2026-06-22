"use client";

import { ChevronDown } from "lucide-react";

interface PhoneFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * IN +91 phone input. Accepts a string of digits (no country code), enforces
 * numeric-only / 10-digit length itself, and exposes the cleaned value via `onChange`.
 */
export function PhoneField({
  id,
  label,
  hint,
  value,
  onChange,
  disabled,
  autoFocus,
}: PhoneFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="group flex h-12 w-full items-center overflow-hidden rounded-xl border border-border/80 bg-background shadow-inner transition-[color,box-shadow] focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
        <div
          className="flex h-full shrink-0 items-center gap-1.5 border-r border-border/70 bg-muted/40 px-3 text-sm font-medium text-foreground"
          aria-hidden
        >
          <span className="text-[1rem] leading-none">🇮🇳</span>
          <span className="leading-none">+91</span>
          <ChevronDown
            className="size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={2.25}
            aria-hidden
          />
        </div>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          placeholder="Enter mobile number"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10))
          }
          className="h-full w-full flex-1 rounded-none border-0 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
