"use client";

import "react-day-picker/style.css";

import { useState } from "react";
import type { CSSProperties } from "react";
import { format, startOfDay } from "date-fns";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { DayPicker } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function DayPickerChevron(props: {
  className?: string;
  size?: number;
  disabled?: boolean;
  orientation?: "up" | "down" | "left" | "right";
}) {
  const { orientation = "left", className, size = 20 } = props;
  const c = cn("shrink-0 text-zinc-400", className);
  if (orientation === "left")
    return <ChevronLeft className={c} size={size} strokeWidth={2} aria-hidden />;
  if (orientation === "right")
    return <ChevronRight className={c} size={size} strokeWidth={2} aria-hidden />;
  if (orientation === "down")
    return <ChevronDown className={c} size={size} strokeWidth={2} aria-hidden />;
  return <ChevronUp className={c} size={size} strokeWidth={2} aria-hidden />;
}

export interface BookSessionCalendarProps {
  id?: string;
  /** ISO yyyy-MM-dd (empty when nothing selected). */
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
  /** Smaller trigger button, suitable for the sidebar form. */
  compact?: boolean;
  disabled?: boolean;
}

/**
 * Date picker used by the booking form. Wraps `react-day-picker` in a popover
 * with the site's light theme styling. Disabled days = anything in the past.
 */
export function BookSessionCalendar({
  id,
  value,
  onChange,
  className,
  compact,
  disabled,
}: BookSessionCalendarProps) {
  const [open, setOpen] = useState(false);

  const parsed = value ? new Date(`${value}T12:00:00`) : undefined;
  const selected = parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
  const today = startOfDay(new Date());

  const label = selected
    ? format(selected, compact ? "EEE, d MMM yyyy" : "EEEE, d MMMM yyyy")
    : "Select a date";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between border-input bg-background font-normal text-foreground shadow-none hover:bg-muted/50",
            compact ? "h-10 px-3 text-sm" : "h-11 px-3",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <CalendarDays
              className={cn(
                "shrink-0 text-primary",
                compact ? "h-3.5 w-3.5" : "h-4 w-4",
              )}
              aria-hidden
            />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown
            className={cn(
              "shrink-0 text-muted-foreground",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto border-border bg-card p-0 text-foreground shadow-2xl"
      >
        <div
          className="rounded-xl p-3 sm:p-4"
          style={
            {
              "--rdp-accent-color": "rgb(10 10 10)",
              "--rdp-accent-background-color": "rgba(24, 24, 27, 0.10)",
              "--rdp-day-height": "40px",
              "--rdp-day-width": "40px",
              "--rdp-day_button-height": "38px",
              "--rdp-day_button-width": "38px",
              "--rdp-day_button-border-radius": "12px",
              "--rdp-selected-border": "2px solid rgb(10 10 10)",
              color: "rgb(24 24 27)",
            } as CSSProperties
          }
        >
          <DayPicker
            mode="single"
            required={false}
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(format(d, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            disabled={{ before: today }}
            showOutsideDays
            components={{ Chevron: DayPickerChevron }}
            className="mx-auto [--rdp-nav-height:2.5rem]"
            classNames={{
              root: "rdp-root w-full max-w-[320px] mx-auto text-sm",
              months: "relative flex flex-col gap-4",
              month: "space-y-3",
              month_caption: "flex h-10 items-center justify-center px-10",
              caption_label: "text-sm font-semibold tracking-tight text-foreground",
              nav: "absolute inset-x-0 top-0 flex w-full justify-between px-1",
              button_previous:
                "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:text-current",
              button_next:
                "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:text-current",
              month_grid: "w-full border-collapse",
              weekdays: "mb-1",
              weekday:
                "w-10 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
              week: "",
              day: "p-0 text-center",
              day_button:
                "inline-flex size-10 items-center justify-center rounded-xl text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-500/60",
              selected:
                "!bg-primary/20 !text-primary ring-1 ring-primary/40 hover:!bg-primary/30",
              today: "font-bold text-primary",
              disabled: "opacity-40 hover:bg-transparent",
              outside: "opacity-40",
              chevron: "!text-muted-foreground",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
