"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getMyBookings } from "@/services/booking";
import { normalizeMyBookings } from "@/lib/booking/normalize";
import type { UserBookingSummary } from "@/lib/booking/types";

export interface UseMyBookingsArgs {
  /** Skip the request when the user isn't signed in. */
  enabled?: boolean;
}

/** Reactive list of the signed-in user's bookings, ready for the history table. */
export function useMyBookings({ enabled = true }: UseMyBookingsArgs = {}) {
  const query = useApiQuery(() => getMyBookings(), [enabled], { enabled });

  const bookings: UserBookingSummary[] = useMemo(() => {
    if (!query.data) return [];
    return normalizeMyBookings(query.data);
  }, [query.data]);

  return { ...query, bookings };
}
