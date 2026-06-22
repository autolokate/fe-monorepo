"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { OTP_LENGTH } from "../constants";

interface OtpFieldProps {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  /** Fires automatically when the input reaches OTP_LENGTH characters. */
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

const CELL_INDEXES = Array.from({ length: OTP_LENGTH }, (_, i) => i);

/**
 * 6-cell OTP input: a single invisible `<input>` captures keystrokes and
 * a row of styled cells display each digit. Paste / autofill / SMS one-time
 * codes work because we read from a real input element.
 */
export const OtpField = forwardRef<HTMLInputElement, OtpFieldProps>(function OtpField(
  { id = "auth-otp", value, onChange, onComplete, disabled },
  ref,
) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        One-time password
      </label>
      <input
        id={id}
        ref={ref}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
          onChange(next);
          if (next.length === OTP_LENGTH) onComplete?.(next);
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={OTP_LENGTH}
        aria-label="One-time password"
        className="peer absolute inset-0 z-10 h-full w-full rounded-xl border-0 bg-transparent p-0 text-center text-transparent caret-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-transparent"
      />

      <div className="pointer-events-none grid grid-cols-6 gap-2 sm:gap-2.5">
        {CELL_INDEXES.map((i) => {
          const digit = value[i];
          const isFilled = value.length > i;
          const isActive = value.length === i;
          return (
            <div
              key={i}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl border bg-background text-lg font-semibold tabular-nums shadow-inner transition-colors sm:h-14 sm:text-xl",
                isActive
                  ? "border-border/80 peer-focus:border-primary peer-focus:ring-2 peer-focus:ring-primary/30"
                  : isFilled
                    ? "border-primary/40 text-foreground"
                    : "border-border/80 text-muted-foreground",
              )}
            >
              {digit ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
});
