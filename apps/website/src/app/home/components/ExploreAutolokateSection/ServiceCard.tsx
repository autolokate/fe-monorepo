import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExploreServiceCard } from "./types";

interface ServiceCardProps {
  card: ExploreServiceCard;
}

export function ServiceCard({ card }: ServiceCardProps) {
  const { title, body, ctaLabel, href, backgroundImage, Icon } = card;
  const isExpert = card.id === "expert-advice";
  const isCompare = card.id === "compare-cars";

  const overlayGradient = isCompare
    ? "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.82) 40%, rgba(0,0,0,0.25) 100%)"
    : "linear-gradient(90deg, rgb(0,0,0) 0%, rgb(0,0,0) 32%, rgba(0,0,0,0.82) 48%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0.12) 100%)";

  return (
    <article className="relative isolate h-[11.25rem] overflow-hidden rounded-2xl bg-black text-white sm:h-[11.5rem]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-black" aria-hidden>
        <Image
          src={backgroundImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={cn(
            "object-cover object-right",
            isExpert
              ? "scale-105 object-[88%_center] grayscale opacity-[0.85]"
              : "opacity-75",
          )}
        />
        <div className="absolute inset-0" style={{ background: overlayGradient }} />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between px-5 py-4 sm:px-5 sm:py-[1.125rem]">
        <div className="min-w-0 max-w-[54%]">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-transparent"
            aria-hidden
          >
            <Icon className="h-4 w-4 text-white" strokeWidth={1.65} />
          </span>

          <h3 className="font-display mt-2.5 text-[0.9375rem] font-bold leading-tight sm:text-base">
            {title}
          </h3>
          <p className="mt-1 text-[11.5px] leading-snug text-white/75 sm:text-xs">{body}</p>
        </div>

        <Link
          href={href}
          className="inline-flex w-fit items-center gap-1.5 rounded-button bg-white px-8 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-zinc-100 sm:py-2 sm:text-xs"
        >
          {ctaLabel}
          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
