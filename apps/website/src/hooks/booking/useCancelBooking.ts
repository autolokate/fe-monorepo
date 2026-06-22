"use client";

import { useApiMutation } from "@/hooks/useApiMutation";
import { cancelBooking } from "@/services/booking";
import type { UseApiMutationOptions } from "@/hooks/useApiMutation";

/** Cancel a single booking by id. Wires standard success/error toasts. */
export function useCancelBooking(
  options: UseApiMutationOptions<unknown, string> = {},
) {
  return useApiMutation<unknown, string>(
    (bookingId: string) => cancelBooking(bookingId),
    {
      successToast: "Booking cancelled.",
      ...options,
    },
  );
}
