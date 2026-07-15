import type { OfferFeature } from './types';

interface OfferCardProps {
  feature: OfferFeature;
}

export function OfferCard({ feature }: OfferCardProps) {
  const { title, body, Icon } = feature;

  return (
    <article className="flex h-full gap-3.5 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)] sm:gap-4 sm:rounded-[20px] sm:p-5">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--al-signal-green)_16%,var(--background))] text-[var(--al-signal-green)]"
        aria-hidden
      >
        <Icon className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-bold leading-snug text-foreground sm:text-[0.9375rem]">
          {title}
        </h3>
        <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground sm:text-[13px]">
          {body}
        </p>
      </div>
    </article>
  );
}
