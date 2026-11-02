/**
 * Server-side read of a shared reel / garage clip (`GET /v1/public/reels/{id}`, anonymous) for the
 * `/r/[id]` · `/c/[id]` preview pages and their Open Graph poster. Never throws: anything but a
 * well-formed 200 is `null` (→ 404 page). No session / auth — this runs on the Next server only.
 */
import { env } from '@/config/env.config';

export type PublicReelKind = 'REEL' | 'GARAGE_CLIP';

export interface PublicReel {
  id: string;
  kind: PublicReelKind;
  title: string;
  caption: string;
  mediaType: 'VIDEO' | 'IMAGE';
  /** Short-lived signed URL — only use it through `/api/share/reels/{id}/poster`. */
  posterUrl: string | null;
  authorKind: 'GARAGE' | 'STORE' | 'AUTOLOKATE';
  authorName: string | null;
  likeCount: number;
  publishedAt: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Re-fetch at most every 60 s — well inside the 300 s poster-URL lifetime. */
export const PUBLIC_REEL_REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 5_000;

export function isReelId(id: string): boolean {
  return UUID_RE.test(id);
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

/** Tolerant parse of the `{data}` envelope; null when the payload is not a usable reel. */
export function parsePublicReel(body: unknown): PublicReel | null {
  const data = (body as { data?: unknown } | null)?.data;
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  const id = str(r.id);
  const title = str(r.title);
  if (!id || !isReelId(id) || !title) return null;
  const author = (r.author ?? {}) as Record<string, unknown>;
  const authorKind =
    author.kind === 'GARAGE' || author.kind === 'STORE' ? author.kind : 'AUTOLOKATE';
  const poster = str(r.posterUrl);
  return {
    id,
    kind: r.kind === 'GARAGE_CLIP' ? 'GARAGE_CLIP' : 'REEL',
    title,
    caption: str(r.caption) ?? '',
    mediaType: r.mediaType === 'IMAGE' ? 'IMAGE' : 'VIDEO',
    posterUrl: poster && /^https?:\/\//i.test(poster) ? poster : null,
    authorKind,
    authorName: str(author.displayName),
    likeCount:
      typeof r.likeCount === 'number' && Number.isFinite(r.likeCount)
        ? Math.max(0, Math.trunc(r.likeCount))
        : 0,
    publishedAt: str(r.publishedAt),
  };
}

/**
 * Fetch one published reel. `fresh` skips the data cache (the poster redirect needs a URL minted
 * now); pages use ISR-style revalidation.
 */
export async function fetchPublicReel(
  id: string,
  opts: { fresh?: boolean; fetchImpl?: typeof fetch; baseUrl?: string } = {},
): Promise<PublicReel | null> {
  if (!isReelId(id)) return null;
  const base = (opts.baseUrl ?? env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL).replace(/\/+$/, '');
  if (!base) return null;
  const doFetch = opts.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  try {
    const init: RequestInit & { next?: { revalidate: number } } = {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      ...(opts.fresh
        ? { cache: 'no-store' as const }
        : { next: { revalidate: PUBLIC_REEL_REVALIDATE_SECONDS } }),
    };
    const res = await doFetch(`${base}/v1/public/reels/${encodeURIComponent(id)}`, init);
    if (!res.ok) return null;
    return parsePublicReel(await res.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** "1.2K" style count (server value only). */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

/** Who to credit on the card. */
export function authorLabel(reel: Pick<PublicReel, 'authorKind' | 'authorName'>): string {
  if (reel.authorKind === 'AUTOLOKATE') return 'Autolokate';
  return (
    reel.authorName ??
    (reel.authorKind === 'STORE' ? 'An Autolokate store' : 'An Autolokate garage')
  );
}

/** Clamp text for meta descriptions. */
export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
