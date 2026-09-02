'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Car, FileText, GitCompare } from 'lucide-react';
import { toast } from 'sonner';

import { BrandLogo } from '@/components/shared/BrandLogo';
import { Button } from '@/components/ui/button';
import type { CatalogueModel } from '@/lib/catalogue/types';
import type { VehicleCategory } from '@/lib/preferences';
import { cn } from '@/lib/utils';

import {
  brandLabelForModel,
  buildModelMetaLine,
  detailsHrefForModel,
  formatModelPriceBlock,
  modelLabelFor,
} from './model-utils';

export function BrandModelCatalogueListRow({
  model,
  idx,
  vehicleType,
  pageBrandSlug,
  displayFallback,
}: {
  model: CatalogueModel;
  idx: number;
  vehicleType: VehicleCategory;
  pageBrandSlug: string;
  displayFallback: string;
}) {
  const brandResolve = brandLabelForModel(model, displayFallback);
  const brandEyebrow = brandResolve.toUpperCase();
  const modelLabel = modelLabelFor(model);
  const metaLine = buildModelMetaLine(model);
  const price = formatModelPriceBlock(model);
  const href = detailsHrefForModel(vehicleType, pageBrandSlug, model);
  const discontinued = model.is_discontinued === true;

  const heroUrl =
    typeof model.hero_image_url === 'string' && model.hero_image_url.trim()
      ? model.hero_image_url.trim()
      : null;

  const onCompare = () => toast.message('Compare isn’t wired on this catalogue view yet.');

  return (
    <li>
      <div
        className={cn(
          'group flex items-stretch gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)] ring-1 ring-black/[0.03]',
          'transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-[0_4px_16px_-8px_rgba(15,23,42,0.14)]',
          'dark:shadow-none dark:ring-white/[0.03] dark:hover:border-primary/25',
        )}
      >
        <Link href={href} tabIndex={-1} aria-hidden className="block shrink-0">
          <div className="relative h-full min-h-[6.5rem] w-28 overflow-hidden bg-muted/60 sm:w-40">
            {heroUrl ? (
              <Image
                src={heroUrl}
                alt={`${brandResolve} ${modelLabel}`}
                fill
                className="object-cover object-center transition duration-300 group-hover:scale-[1.025] motion-reduce:transition-none"
                sizes="(max-width: 640px) 112px, 160px"
                priority={idx < 6}
              />
            ) : (
              <div className="flex h-full min-h-[6.5rem] items-center justify-center">
                <Car className="h-8 w-8 text-muted-foreground/30" aria-hidden />
              </div>
            )}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-4">
          <Link href={href} className="flex min-w-0 flex-1 flex-col gap-1 outline-none">
            <div className="flex flex-wrap items-center gap-2">
              <BrandLogo
                brand={brandResolve}
                size={24}
                className="shrink-0 rounded-md border border-neutral-600/50 bg-black dark:border-neutral-200/60 dark:bg-white"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                {brandEyebrow}
              </p>
              {discontinued ? (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                  Discontinued
                </span>
              ) : null}
            </div>
            <h2 className="font-display text-[0.9375rem] font-semibold tracking-tight text-foreground sm:text-base">
              {modelLabel}
            </h2>
            {metaLine ? (
              <p className="line-clamp-2 text-[11px] text-muted-foreground sm:line-clamp-1">
                {metaLine}
              </p>
            ) : null}
          </Link>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-4">
            <div className="min-w-[7rem]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                Ex-showroom
              </p>
              <p className="font-display text-base font-bold tabular-nums tracking-tight text-foreground">
                {price.line}
              </p>
              {price.hint ? (
                <p className="text-[10px] text-muted-foreground">{price.hint}</p>
              ) : null}
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 sm:flex-initial">
              <Button
                size="sm"
                variant="default"
                className="h-8 bg-primary px-4 text-[0.8125rem] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                asChild
              >
                <Link href={href} className="inline-flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Details
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                className="h-8 gap-1.5 border-primary bg-transparent px-3 text-[0.8125rem] font-semibold text-primary hover:bg-primary/10"
                onClick={onCompare}
              >
                <GitCompare className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Compare
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
