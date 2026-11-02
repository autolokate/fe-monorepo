import { Heart, Play } from 'lucide-react';

import { AppleGlyph, GooglePlayGlyph } from '@/layouts/Footer/constants';
import { ANDROID_STORE_URL, IOS_STORE_URL } from '@/lib/app-links/config';
import { authorLabel, formatCount, type PublicReel } from '@/lib/share/public-reel';
import { posterPath } from '@/lib/share/share-meta';

import { OpenInAppButton } from './OpenInAppButton';

function StoreButton({
  href,
  top,
  bottom,
  icon,
}: {
  href: string;
  top: string;
  bottom: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${top} ${bottom}`}
      className="flex items-center gap-3 rounded-xl bg-black px-4 py-2.5 text-white transition hover:opacity-90"
    >
      <span aria-hidden>{icon}</span>
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] opacity-80">{top}</span>
        <span className="text-base font-semibold">{bottom}</span>
      </span>
    </a>
  );
}

/** Store badges shared by the preview and the not-found state. */
export function StoreButtons() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <StoreButton
        href={ANDROID_STORE_URL}
        top="Get it on"
        bottom="Google Play"
        icon={<GooglePlayGlyph className="h-6 w-6" />}
      />
      <StoreButton
        href={IOS_STORE_URL}
        top="Download on the"
        bottom="App Store"
        icon={<AppleGlyph className="h-6 w-6 text-white" />}
      />
    </div>
  );
}

/** Server-rendered preview card for a shared reel / garage clip. */
export function SharePreview({ reel }: { reel: PublicReel }) {
  const noun = reel.kind === 'GARAGE_CLIP' ? 'Garage clip' : 'AutoClip';
  return (
    <main className="relative flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-orange-50 via-background to-background dark:from-orange-950/20" />
      <article className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="relative aspect-[9/12] w-full bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- redirects to a short-lived signed URL; next/image would cache it past expiry */}
          <img
            src={posterPath(reel.id)}
            alt={reel.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          {reel.mediaType === 'VIDEO' && (
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 backdrop-blur">
              <Play className="h-8 w-8 fill-white text-white" aria-hidden />
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {noun} · {authorLabel(reel)}
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">{reel.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm opacity-90">
              <Heart className="h-4 w-4 fill-current" aria-hidden />
              {formatCount(reel.likeCount)} likes
            </p>
          </div>
        </div>
        <div className="space-y-5 p-6 text-center">
          {reel.caption && (
            <p className="line-clamp-4 whitespace-pre-line text-left text-sm text-muted-foreground">
              {reel.caption}
            </p>
          )}
          <OpenInAppButton
            reelId={reel.id}
            className="w-full rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-orange-600"
          />
          <p className="text-xs text-muted-foreground">
            Don&apos;t have the app yet? Watch it in IDG: Autolokate.
          </p>
          <StoreButtons />
        </div>
      </article>
    </main>
  );
}
