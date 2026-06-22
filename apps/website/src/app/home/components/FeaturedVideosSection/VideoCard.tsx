import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { youtubeThumbnailUrl } from "@/lib/idg";
import { IDG_CHANNEL_NAME } from "./constants";
import type { FeaturedVideo } from "./types";

interface VideoCardProps {
  video: FeaturedVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const { title, summary, category, thumbnailLabel, duration, href, videoId } = video;
  const thumbnail = youtubeThumbnailUrl(videoId, "hqdefault");

  return (
    <article className="min-w-0">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-sm transition-shadow duration-200 hover:shadow-md"
        aria-label={`Watch video: ${title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-950 sm:aspect-video">
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(max-width: 1024px) 45vw, 22vw"
            className="object-cover grayscale contrast-[1.08] transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="pointer-events-none absolute inset-0 bg-black/10" aria-hidden />
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/5"
            aria-hidden
          />
          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold leading-tight text-white backdrop-blur-sm">
            {thumbnailLabel}
          </span>
          {duration ? (
            <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
              {duration}
            </span>
          ) : null}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md transition-transform duration-300 group-hover:scale-105">
              <Play className="h-5 w-5 fill-current pl-0.5" />
            </span>
          </span>
        </div>

        <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-4">
          <h3 className="font-display min-h-12 line-clamp-2 text-[0.9375rem] font-bold leading-snug text-foreground">
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {summary}
          </p>
          <div className="mt-4 flex min-w-0 items-center gap-2 rounded-lg bg-zinc-100/90 px-2.5 py-2 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" aria-hidden />
            <span className="min-w-0 truncate">
              {category} · {IDG_CHANNEL_NAME}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
