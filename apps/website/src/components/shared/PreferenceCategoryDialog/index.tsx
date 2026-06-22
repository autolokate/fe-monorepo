"use client";

import { useEffect, useId, useState } from "react";
import { Bike, Car, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  VEHICLE_CATEGORY_OPTIONS,
  type VehicleCategory,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";

const ICON_BY_CATEGORY: Record<VehicleCategory, typeof Car> = {
  cars: Car,
  bikes: Bike,
};

export interface PreferenceCategoryDialogProps {
  open: boolean;
  /** Selection to pre-fill when the dialog opens. */
  defaultValue?: VehicleCategory | null;
  onOpenChange: (open: boolean) => void;
  /**
   * Fired when the user confirms a choice. The parent is expected to persist
   * the value and dismiss the dialog (e.g. by flipping `open` to `false`).
   */
  onSubmit: (value: VehicleCategory) => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

/**
 * Reusable "what are you shopping for?" prompt.
 *
 * Two radio options (Cars / Bikes) presented as theme-aware cards. The dialog
 * itself is purely controlled — the parent owns `open` state and persistence
 * via `onSubmit`. All colors are derived from the design-token palette so the
 * popup adapts automatically to light and dark themes.
 */
export function PreferenceCategoryDialog({
  open,
  defaultValue,
  onOpenChange,
  onSubmit,
  title = "What are you shopping for?",
  description = "Pick a vehicle type so we can personalise your experience. You can change this any time.",
  submitLabel = "Save preference",
  cancelLabel = "Not now",
}: PreferenceCategoryDialogProps) {
  const groupName = useId();
  const [selected, setSelected] = useState<VehicleCategory>(
    defaultValue ?? VEHICLE_CATEGORY_OPTIONS[0]!.value,
  );

  useEffect(() => {
    if (open) {
      setSelected(defaultValue ?? VEHICLE_CATEGORY_OPTIONS[0]!.value);
    }
  }, [open, defaultValue]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <fieldset
            role="radiogroup"
            aria-label="Vehicle category"
            className="grid grid-cols-2 gap-3"
          >
            <legend className="sr-only">Vehicle category</legend>
            {VEHICLE_CATEGORY_OPTIONS.map((option) => {
              const Icon = ICON_BY_CATEGORY[option.value];
              const active = selected === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border bg-background px-4 py-5 text-center transition",
                    "hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30",
                    active
                      ? "border-primary/70 bg-primary/[0.08] ring-2 ring-primary/25"
                      : "border-border",
                  )}
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={option.value}
                    checked={active}
                    onChange={() => setSelected(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-foreground",
                    )}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {option.label}
                  </span>
                  <span className="text-[11px] leading-snug text-muted-foreground">
                    {option.description}
                  </span>
                  <span
                    className={cn(
                      "absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-transparent",
                    )}
                    aria-hidden
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                </label>
              );
            })}
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" aria-hidden />
              {cancelLabel}
            </Button>
            <Button type="submit">
              <Check className="h-4 w-4" aria-hidden />
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
