"use client";

import { ExternalLink, Loader2, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { canCancelBooking } from "@/lib/booking/normalize";
import type { UserBookingSummary } from "@/lib/booking/types";

function statusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("confirm"))
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (s.includes("cancel"))
    return "text-rose-600 bg-rose-50 border-rose-200";
  if (s.includes("pending"))
    return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-zinc-600 bg-zinc-100 border-zinc-300";
}

function statusDot(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("confirm")) return "bg-emerald-500";
  if (s.includes("cancel")) return "bg-rose-500";
  if (s.includes("pending")) return "bg-amber-400";
  return "bg-zinc-400";
}

export interface BookingHistoryMiniProps {
  bookings: UserBookingSummary[];
  isLoading?: boolean;
  /** When provided, a small "x" appears next to cancellable bookings. */
  onRequestCancel?: (booking: UserBookingSummary) => void;
  /** Id currently being cancelled — used to show a spinner on that row. */
  cancellingId?: string | null;
}

export function BookingHistoryMini({
  bookings,
  isLoading,
  onRequestCancel,
  cancellingId,
}: BookingHistoryMiniProps) {
  const rows = bookings.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Booking History
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
          Loading your bookings…
        </div>
      ) : rows.length === 0 ? (
        <p className="px-4 py-5 text-xs text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[380px] text-xs">
            <thead>
              <tr className="border-b border-border/50">
                {["Booking ID", "Date", "Status", "Time", ""].map((h, i) => (
                  <th
                    key={`${h}-${i}`}
                    className="px-4 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const cancellable = canCancelBooking(b);
                const isCancelling = cancellingId === b.id;
                return (
                  <tr
                    key={b.id}
                    className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5 font-mono text-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                            statusDot(b.status),
                          )}
                          aria-hidden
                        />
                        {b.id.length > 12 ? `${b.id.slice(0, 12)}…` : b.id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {b.slotDate || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          statusBadge(b.status),
                        )}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {b.slotStartLabel || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {cancellable && onRequestCancel ? (
                        <button
                          type="button"
                          aria-label="Cancel booking"
                          onClick={() => onRequestCancel(b)}
                          disabled={isCancelling}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        >
                          {isCancelling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          ) : (
                            <X className="h-3.5 w-3.5" aria-hidden />
                          )}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {bookings.some((b) => b.meetLink) && (
        <div className="border-t border-border/50 px-4 py-3">
          {bookings
            .filter((b) => b.meetLink)
            .slice(0, 1)
            .map((b) => (
              <a
                key={b.id}
                href={b.meetLink!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                <Video className="h-3.5 w-3.5" aria-hidden />
                Join active session
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
