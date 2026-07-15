'use client';

import Image from 'next/image';
import Link from 'next/link';

import { GitCompare, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { comparePathWithModelSegments } from '@/lib/catalogue/compare-url';
import { formatINR, cn } from '@/lib/utils';
import type { VehicleCategory } from '@/lib/preferences';
import { useCompareSuggestedPairs } from '@/hooks/catalogue/useCompareSuggestedPairs';

type Props = {
  vehicleCategory: VehicleCategory;
  className?: string;
};

export function CompareSuggestedPairs({ vehicleCategory, className }: Props) {
  const { pairs, isLoading, isError } = useCompareSuggestedPairs(vehicleCategory);

  if (isError || (!isLoading && pairs.length === 0)) return null;

  if (isLoading) {
    return (
      <div
        className={cn(
          'mb-8 rounded-2xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-foreground/[0.03] sm:p-5',
          className,
        )}
      >
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="flex gap-3 overflow-hidden pb-1">
          <div className="h-48 w-[min(84vw,320px)] shrink-0 animate-pulse rounded-2xl bg-muted sm:h-44 sm:w-[300px]" />
          <div className="hidden h-48 w-[min(84vw,320px)] shrink-0 animate-pulse rounded-2xl bg-muted sm:block sm:h-44 sm:w-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mb-8 rounded-2xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-foreground/[0.03] sm:p-5',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Suggested pairs
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tap any pair to start a quick 2-variant comparison.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="h-7 gap-1.5 rounded-full border border-border/80 bg-background px-3 text-[11px] font-semibold text-foreground"
        >
          <Zap className="h-3 w-3 text-foreground" aria-hidden />
          Quick start
        </Badge>
      </div>

      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="flex w-max snap-x snap-mandatory gap-3 sm:gap-4"
          role="list"
          aria-label="Suggested comparison pairs"
        >
          {pairs.map(([a, b]) => {
            const href = comparePathWithModelSegments(
              [
                { brandSlug: a.brandSlug, modelSlug: a.modelSlug },
                { brandSlug: b.brandSlug, modelSlug: b.modelSlug },
              ],
              vehicleCategory,
            );
            return (
              <div
                key={`${a.variantId}-${b.variantId}`}
                role="listitem"
                className="group flex w-[min(84vw,340px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md sm:w-[320px] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
                  <SuggestedHalf entry={a} />
                  <div className="flex items-center justify-center px-0.5">
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[9px] font-black tracking-widest text-muted-foreground">
                      VS
                    </span>
                  </div>
                  <SuggestedHalf entry={b} />
                </div>

                <div className="border-t border-border/80 px-3 py-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-full border-border/80 text-xs font-semibold text-foreground hover:border-foreground/40 hover:bg-foreground/[0.04]"
                    asChild
                  >
                    <Link href={href}>
                      <GitCompare className="h-3.5 w-3.5" aria-hidden />
                      Compare now
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SuggestedHalf({
  entry,
}: {
  entry: { brandLabel: string; modelLabel: string; image: string | null; price: number | null };
}) {
  return (
    <div className="p-3">
      <div className="relative mx-auto aspect-[5/3] w-full overflow-hidden rounded-lg border border-border/60 bg-muted/60">
        {entry.image ? (
          <Image src={entry.image} alt="" fill className="object-cover" sizes="120px" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
            —
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-[11px] font-bold text-foreground">{entry.brandLabel}</p>
      <p className="line-clamp-1 text-[11px] text-muted-foreground">{entry.modelLabel}</p>
      <p className="mt-0.5 text-[11px] font-bold text-foreground">
        {entry.price != null ? formatINR(entry.price) : '—'}
      </p>
    </div>
  );
}
