import { fetchPublicReel } from '@/lib/share/public-reel';

export const dynamic = 'force-dynamic';

/** Raster fallback when a clip has no poster (crawlers ignore SVG og:images). */
export const FALLBACK_POSTER_PATH = '/brand_bg_light.png';

/**
 * Stable poster URL for Open Graph / Twitter cards and the preview page: the backend only hands out
 * short-lived (300 s) signed media URLs, so this redirects to one minted right now. Unknown or
 * unpublished clips — and clips without a poster — redirect to the brand image.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reel = await fetchPublicReel(id, { fresh: true });
  const target = reel?.posterUrl ?? new URL(FALLBACK_POSTER_PATH, request.url).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      // Shorter than the signed URL's lifetime so a cached redirect never points at an expired URL.
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}
