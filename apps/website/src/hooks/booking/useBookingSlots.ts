"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getBookingSlotsByDate } from "@/services/booking";
import { normalizeSlotsForDate } from "@/lib/booking/normalize";
import type { ExpertTimeSlot } from "@/lib/booking/types";

export interface UseBookingSlotsArgs {
  /** ISO yyyy-MM-dd. When falsy the query is disabled. */
  date: string;
  /** Extra gate — usually `useIsAuthenticated()`. */
  enabled?: boolean;
}

/**
 * Load + normalise the available slots for one calendar day.
 * Re-runs whenever `date` or `enabled` change.
 */
export function useBookingSlots({ date, enabled = true }: UseBookingSlotsArgs) {
  const query = useApiQuery(
    () => getBookingSlotsByDate(date),
    [date, enabled],
    { enabled: Boolean(enabled && date) },
  );

  const slots: ExpertTimeSlot[] = useMemo(() => {
    if (!query.data || !date) return [];
    return normalizeSlotsForDate(query.data, date);
  }, [query.data, date]);

  return { ...query, slots };
}
