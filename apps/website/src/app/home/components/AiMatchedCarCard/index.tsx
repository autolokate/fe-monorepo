"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { AdvisorMatchCard } from "@/lib/advisor/types";
import { cn } from "@/lib/utils";

type Props = {
  row: AdvisorMatchCard;
  onNavigate?: () => void;
};

/**
 * Card used in the AI-matched results grid.
 * - Image with overlay match-score badge top-right.
 * - Title + variant line + subtitle + price (right-aligned).
 * - Up to 4 reasons rendered as a 2-col grid.
 * - Footer "View full details" link (when `href` is set).
 */
export function AiMatchedCarCard({ row, onNavigate }: Props) {
  const shell = cn(
    "group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-left",
    "shadow-[0_2px_16px_-6px_rgba(0,0,0,0.14)]",
    "transition-[transform,box-shadow,border-color] duration-200 ease-out",
    "hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)]",
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  );

  const body = (
    <>
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        {row.imageUrl ? (
          <Image
            src={row.imageUrl}
            alt={row.imageAlt}
            fill
            className="object-cover object-center transition duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24rem"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              No image
            </span>
          </div>
        )}

        {row.score != null && (
          <div
            className={cn(
              "absolute right-3 top-3 flex min-w-[3.25rem] flex-col items-center rounded-xl px-3 py-2",
              "border border-border/80 bg-white/95 shadow-[0_2px_8px_rgba(15,23,42,0.10)] backdrop-blur-md",
            )}
          >
            <span className="font-display text-2xl font-bold leading-none tabular-nums text-primary sm:text-[1.75rem]">
              {row.score}
            </span>
            <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Match score
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold leading-snug tracking-tight text-foreground sm:text-[1.0625rem]">
              {row.title}
            </h3>
            {row.variantLine ? (
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {row.variantLine}
              </p>
            ) : null}
            {row.subtitle ? (
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/70">
                {row.subtitle}
              </p>
            ) : null}
          </div>

          {row.priceLabel ? (
            <div className="shrink-0 text-right">
              <p className="font-display text-sm font-bold tracking-tight text-primary whitespace-nowrap sm:text-[0.9375rem]">
                {row.priceLabel}
              </p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
                Ex-showroom
              </p>
            </div>
          ) : null}
        </div>

        {row.reasons.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            {row.reasons.slice(0, 4).map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-1.5 text-[10.5px] leading-snug text-muted-foreground sm:text-[11px]"
              >
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary"
                  aria-hidden
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/50 px-4 py-3 sm:px-5">
        {row.href ? (
          <span className="flex items-center gap-1 text-sm font-semibold text-primary transition-[gap,opacity] duration-150 group-hover:gap-2 group-hover:opacity-90">
            View full details
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Details unavailable</span>
        )}
      </div>
    </>
  );

  if (row.href) {
    return (
      <Link href={row.href} className={shell} onClick={onNavigate}>
        {body}
      </Link>
    );
  }

  return (
    <div className={cn(shell, "cursor-default hover:translate-y-0 hover:shadow-sm")}>
      {body}
    </div>
  );
}
