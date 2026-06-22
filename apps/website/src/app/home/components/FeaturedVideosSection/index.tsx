import { BookOpen, Play, Youtube } from "lucide-react";
import { FEATURED_VIDEOS, FEATURED_VIDEOS_COPY } from "./constants";
import { SectionCtaLink } from "./SectionCtaLink";
import { VideoCard } from "./VideoCard";

export function FeaturedVideosSection() {
  const { eyebrow, headline, description, primaryCta, secondaryCta } = FEATURED_VIDEOS_COPY;

  return (
    <section
      aria-labelledby="featured-videos-heading"
      className="relative isolate z-[1] bg-[#f6f6f7] py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,42%)_minmax(0,58%)] xl:gap-x-16">
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              <Play className="h-3 w-3 fill-current" aria-hidden />
              {eyebrow}
            </span>

            <h2
              id="featured-videos-heading"
              className="font-display mt-4 max-w-[18rem] text-balance text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:max-w-md sm:text-4xl xl:pr-4 lg:text-[2.35rem]"
            >
              {headline}
            </h2>

            <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
              {description}
            </p>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3">
              <SectionCtaLink
                href={primaryCta.href}
                label={primaryCta.label}
                icon={Youtube}
                variant="primary"
                external
              />
              <SectionCtaLink
                href={secondaryCta.href}
                label={secondaryCta.label}
                icon={BookOpen}
                variant="secondary"
              />
            </div>
          </div>

          <div className="min-w-0">
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3 xl:gap-4">
              {FEATURED_VIDEOS.map((video) => (
                <li key={video.id} className="min-w-0">
                  <VideoCard video={video} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
