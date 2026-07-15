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

export function BrandModelCatalogueCard({
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
  const anchor = model.slug || model.model_slug || `model-${idx}`;
  const safeHash = encodeURIComponent(anchor).replace(/%/g, '');
  const brandResolve = brandLabelForModel(model, displayFallback);
  const brandEyebrow = brandResolve.toUpperCase();
  const modelLabel = modelLabelFor(model);
  const metaLine = buildModelMetaLine(model);
  const price = formatModelPriceBlock(model);
  const href = detailsHrefForModel(vehicleType, pageBrandSlug, model);

  const heroUrl =
    typeof model.hero_image_url === 'string' && model.hero_image_url.trim()
      ? model.hero_image_url.trim()
      : null;

  const discontinued = model.is_discontinued === true;

  const onCompare = () => toast.message('Compare isn’t wired on this catalogue view yet.');

  return (
    <li id={`m-${safeHash}`} className="min-h-0 scroll-mt-24">
      <div
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-left shadow-[0_2px_12px_-6px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03]',
          'transition-[transform,box-shadow,border-color] duration-200',
          'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          'dark:shadow-none dark:ring-white/[0.03] dark:hover:border-primary/35 dark:hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_8px_32px_-12px_hsl(var(--primary)/0.25)]',
        )}
      >
        <Link href={href} tabIndex={-1} aria-hidden className="block shrink-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/60 dark:bg-muted/40">
            {heroUrl ? (
              <Image
                src={heroUrl}
                alt={`${brandResolve} ${modelLabel}`}
                fill
                className="object-cover object-center transition duration-300 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24rem"
                priority={idx < 3}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Car className="h-10 w-10 text-muted-foreground/30" aria-hidden />
              </div>
            )}
            {discontinued ? (
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur-sm">
                Discontinued
              </span>
            ) : null}
          </div>
        </Link>

        <Link
          href={href}
          className="flex min-w-0 flex-1 flex-col gap-3 px-3.5 pb-3.5 pt-3 outline-none sm:px-4 sm:pb-4 sm:pt-3.5"
        >
          <div className="flex items-start gap-3">
            <BrandLogo
              brand={brandResolve}
              size={30}
              className="mt-0.5 shrink-0 rounded-full border border-neutral-600/50 bg-black text-white shadow-none dark:border-neutral-200/60 dark:bg-white dark:text-neutral-900"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                {brandEyebrow}
              </p>
              <h2 className="font-display text-[0.9rem] font-semibold leading-snug tracking-tight text-foreground sm:text-[0.9375rem]">
                {modelLabel}
              </h2>
              {metaLine ? (
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground sm:line-clamp-1 sm:text-[11px]">
                  {metaLine}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto border-t border-border/60 pt-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary/70 sm:text-[10px]">
              Ex-showroom (indicative)
            </p>
            <p className="font-display mt-0.5 text-[1.0625rem] font-bold tabular-nums tracking-tight text-foreground sm:text-lg">
              {price.line}
            </p>
            {price.hint ? (
              <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                {price.hint}
              </p>
            ) : null}
          </div>
        </Link>

        <div className="flex shrink-0 gap-2 border-t border-border/60 bg-card px-3.5 py-2.5 sm:px-4 sm:py-3">
          <Button
            size="sm"
            variant="default"
            className="h-8 min-h-8 flex-1 bg-primary px-4 text-[0.8125rem] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
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
            className="h-8 min-h-8 flex-1 border-primary bg-transparent px-4 text-[0.8125rem] font-semibold text-primary shadow-none hover:bg-primary/10"
            onClick={onCompare}
          >
            <GitCompare className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Compare
          </Button>
        </div>
      </div>
    </li>
  );
}
