import Image from "next/image";
import { Radio } from "lucide-react";
import { MEDIA_HERO } from "../../constants";
import { MEDIA_HERO_BG } from "./constants";

export function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/70 bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src={MEDIA_HERO_BG.light}
          alt=""
          fill
          priority
          sizes="100vw"
          className="theme-light-only object-cover object-center opacity-[0.5]"
        />
        <Image
          src={MEDIA_HERO_BG.dark}
          alt=""
          fill
          priority
          sizes="100vw"
          className="theme-dark-only object-cover object-center opacity-[0.72]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/35 dark:from-background dark:via-background/82 dark:to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent sm:h-24" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent sm:h-24" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          <Radio className="h-3.5 w-3.5" aria-hidden />
          {MEDIA_HERO.eyebrow}
        </span>

        <h1 className="font-display mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
          {MEDIA_HERO.headline}{" "}
          <span className="text-primary">{MEDIA_HERO.headlineEm}</span>{" "}
          {MEDIA_HERO.headlineSuffix}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
          {MEDIA_HERO.subhead}
        </p>

        <p className="mt-6 text-sm font-medium tabular-nums text-muted-foreground">
          {MEDIA_HERO.stats}
        </p>
      </div>
    </section>
  );
}
