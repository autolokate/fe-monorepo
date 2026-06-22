import Image from "next/image";
import type { ProtectionLayerCard } from "./types";

interface LayerComparisonCardProps {
  layer: ProtectionLayerCard;
}

export function LayerComparisonCard({ layer }: LayerComparisonCardProps) {
  const { title, body, Icon, layerLabel, imageSrc, imageAlt } = layer;

  return (
    <article className="relative flex h-full min-h-[11.5rem] flex-col gap-4 overflow-hidden rounded-2xl border border-black/10 bg-card p-4 shadow-[0_2px_12px_rgba(15,23,42,0.06)] sm:min-h-[10.5rem] sm:flex-row sm:items-stretch sm:gap-5 sm:p-5 lg:rounded-3xl lg:min-h-[11rem] lg:p-6">
      {imageSrc ? (
        <div
          className="pointer-events-none absolute bottom-0 right-0 z-0 h-[58%] w-[78%] sm:h-full sm:w-[58%] lg:w-[54%]"
          aria-hidden
        >
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            sizes="(max-width: 640px) 72vw, 320px"
            className="object-contain object-right-bottom sm:scale-110 sm:origin-bottom-right lg:scale-[1.15]"
          />
        </div>
      ) : null}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3 sm:max-w-[58%] sm:gap-3.5 lg:max-w-[52%]">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 text-black"
            aria-hidden
          >
            <Icon className="h-5 w-5 stroke-[1.75]" />
          </span>
          <div className="min-w-0 pt-0.5">
            <span className="inline-flex rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black/70">
              {layerLabel}
            </span>
            <h3 className="mt-2 text-base font-bold leading-snug text-foreground sm:text-[1.05rem]">
              {title}
            </h3>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{body}</p>
      </div>
    </article>
  );
}
