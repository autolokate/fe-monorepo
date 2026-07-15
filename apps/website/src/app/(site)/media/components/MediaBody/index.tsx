'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Clock, LayoutGrid, Newspaper, PenLine, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { INDIAN_DRIVE_GUIDE_CHANNEL_URL } from '@/lib/idg';
import {
  type MediaFilterId,
  MEDIA_BLOG_POSTS,
  MEDIA_VIDEOS,
  videoThumbnailSrc,
} from '../../constants';
import { MediaFeaturedVideo } from '../MediaFeaturedVideo';

const FILTERS: { id: MediaFilterId; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'videos', label: 'Videos', icon: Play },
  { id: 'blog', label: 'Blog', icon: PenLine },
];

export function MediaBody() {
  const [filter, setFilter] = useState<MediaFilterId>('all');
  const showVideos = filter === 'all' || filter === 'videos';
  const showBlog = filter === 'all' || filter === 'blog';

  return (
    <section className="relative bg-secondary/40 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="theme-dark-only absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_0%,rgba(59,130,246,0.08),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:space-y-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Browse
          </p>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Media categories">
            {FILTERS.map(({ id, label, icon: Icon }) => {
              const active = filter === id;
              return (
                <Button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  className="px-4"
                  onClick={() => {
                    setFilter(id);
                  }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        {showVideos ? (
          <div className="space-y-6">
            <MediaFeaturedVideo />
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Videos
                </p>
                <h3 className="font-display mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
                  More to watch
                </h3>
              </div>
              <a
                href={INDIAN_DRIVE_GUIDE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View all on YouTube
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {MEDIA_VIDEOS.map((v) => (
                <li key={v.videoId + v.title}>
                  <a
                    href={`https://youtu.be/${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-full"
                  >
                    <Card className="overflow-hidden border-border/80 shadow-app-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
                      <div className="relative aspect-video overflow-hidden bg-zinc-950">
                        <Image
                          src={videoThumbnailSrc(v.videoId)}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-90" />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
                          <Play className="h-3 w-3 fill-current" aria-hidden />
                          {v.duration}
                        </span>
                      </div>
                      <div className="space-y-2 p-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          {v.category}
                        </span>
                        <p className="font-display line-clamp-2 font-semibold leading-snug text-foreground">
                          {v.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {v.viewsLabel} · {v.publishedLabel}
                        </p>
                      </div>
                    </Card>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {showBlog ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  From the desk
                </p>
                <h3 className="font-display mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
                  <Newspaper className="h-7 w-7 text-primary sm:h-8 sm:w-8" aria-hidden />
                  Articles & notes
                </h3>
              </div>
              <Link
                href="/about-us"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                About Autolokate
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MEDIA_BLOG_POSTS.map((post) => {
                const card = (
                  <Card className="flex h-full flex-col overflow-hidden border-border/80 shadow-app-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
                    <div className="relative aspect-video overflow-hidden bg-zinc-950">
                      <Image
                        src={post.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
                        <Clock className="h-3 w-3" aria-hidden />
                        {post.readTime}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col space-y-2 p-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {post.category.toUpperCase()}
                      </span>
                      <p className="font-display line-clamp-3 flex-1 font-semibold leading-snug text-foreground">
                        {post.title}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        {post.external ? 'Watch on YouTube' : 'Read more'}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Card>
                );
                return (
                  <li key={post.id} className="h-full">
                    {post.external ? (
                      <a
                        href={post.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block h-full"
                      >
                        {card}
                      </a>
                    ) : (
                      <Link href={post.href} className="group block h-full">
                        {card}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
