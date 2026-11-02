import type { Metadata } from 'next';

import { authorLabel, clampText, type PublicReel } from './public-reel';

export type ShareRouteKind = 'r' | 'c';

/** Public origin for share URLs / absolute og:image (prod: https://autolokate.com). */
export function shareOrigin(env: Record<string, string | undefined> = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();
  return (raw && /^https?:\/\//.test(raw) ? raw : 'https://autolokate.com').replace(/\/+$/, '');
}

export function sharePath(kind: ShareRouteKind, id: string): string {
  return `/${kind}/${encodeURIComponent(id)}`;
}

export function posterPath(id: string): string {
  return `/api/share/reels/${encodeURIComponent(id)}/poster`;
}

/** Open Graph + Twitter card metadata for a shared reel / garage clip. */
export function shareMetadata(
  kind: ShareRouteKind,
  reel: PublicReel | null,
  id: string,
  origin: string = shareOrigin(),
): Metadata {
  if (!reel) {
    return {
      title: 'Clip not available — Autolokate',
      description: 'This clip is no longer available. Watch more AutoClips in the Autolokate app.',
      robots: { index: false },
    };
  }
  const noun = reel.kind === 'GARAGE_CLIP' ? 'garage clip' : 'AutoClip';
  const title = clampText(reel.title, 90);
  const description = clampText(
    reel.caption || `Watch this ${noun} by ${authorLabel(reel)} on Autolokate.`,
    200,
  );
  const url = `${origin}${sharePath(kind, id)}`;
  const image = { url: `${origin}${posterPath(id)}`, alt: title };
  return {
    title: `${title} — Autolokate`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Autolokate',
      type: reel.mediaType === 'VIDEO' ? 'video.other' : 'article',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
    appLinks: {
      ios: {
        url: `autolokate://discover/spotlight?startId=${encodeURIComponent(id)}`,
        app_store_id: '6733244175',
        app_name: 'IDG: Autolokate',
      },
      android: {
        package: 'com.mycompany.indiandriveguide',
        app_name: 'IDG: Autolokate',
        url: `autolokate://discover/spotlight?startId=${encodeURIComponent(id)}`,
      },
    },
    other: { 'apple-itunes-app': `app-id=6733244175, app-argument=${url}` },
  };
}
