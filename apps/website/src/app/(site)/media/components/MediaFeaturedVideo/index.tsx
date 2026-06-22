"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoutubeIcon } from "@/layouts/Footer/constants";
import { INDIAN_DRIVE_GUIDE_CHANNEL_URL } from "@/lib/idg";
import { MEDIA_FEATURED_VIDEO, videoThumbnailSrc } from "../../constants";

export function MediaFeaturedVideo() {
  const [playing, setPlaying] = useState(false);
  const { videoId, title, duration, viewsLabel, publishedLabel } =
    MEDIA_FEATURED_VIDEO;
  const thumb = videoThumbnailSrc(videoId);
  const ytWatchUrl = `https://youtu.be/${videoId}`;
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-app-soft">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative isolate min-h-[240px] overflow-hidden bg-zinc-950 sm:min-h-[300px] lg:min-h-[320px]">
          {playing ? (
            <iframe
              key="media-featured-embed"
              src={embedSrc}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play video: ${title}`}
              className="group absolute inset-0 flex items-center justify-center"
            >
              <Image
                src={thumb}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span
                className="absolute inset-0 bg-gradient-to-br from-zinc-950/70 via-zinc-950/40 to-zinc-950/60"
                aria-hidden
              />
              <span
                aria-hidden
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-primary shadow-[0_18px_44px_-14px_rgba(0,0,0,0.6)] ring-4 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-white sm:h-24 sm:w-24"
              >
                <Play className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" />
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 p-7 sm:p-9 lg:p-10">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">{duration}</span>
            <span aria-hidden>·</span>
            <span>{viewsLabel}</span>
            <span aria-hidden>·</span>
            <span>{publishedLabel}</span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            From the{" "}
            <a
              href={INDIAN_DRIVE_GUIDE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Indian Drive Guide
            </a>{" "}
            channel — practical context filmed on Indian roads.
          </p>
          <div className="pt-1">
            <Button size="lg" asChild>
              <a href={ytWatchUrl} target="_blank" rel="noopener noreferrer">
                <YoutubeIcon className="h-4 w-4" aria-hidden />
                Watch on YouTube
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
