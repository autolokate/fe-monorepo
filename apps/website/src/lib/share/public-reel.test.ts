import { afterEach, describe, expect, it, vi } from 'vitest';

import { GET as getPoster } from '../../app/api/share/reels/[id]/poster/route';
import {
  authorLabel,
  clampText,
  fetchPublicReel,
  formatCount,
  parsePublicReel,
} from './public-reel';
import { posterPath, shareMetadata, shareOrigin } from './share-meta';

const ID = '4f1d2c3b-5a69-4788-9abc-def012345678';
const wire = {
  id: ID,
  kind: 'GARAGE_CLIP',
  title: 'Brake pad swap',
  caption: 'Quick DIY at Sharma Motors',
  mediaType: 'VIDEO',
  posterUrl: 'https://s3.example/thumb.jpg?X-Amz-Signature=abc',
  posterExpiresInSeconds: 300,
  author: { kind: 'GARAGE', displayName: 'Sharma Motors' },
  likeCount: 1234,
  publishedAt: '2026-11-01T10:00:00.000Z',
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parsePublicReel', () => {
  it('reads the {data} envelope', () => {
    expect(parsePublicReel({ data: wire })).toEqual({
      id: ID,
      kind: 'GARAGE_CLIP',
      title: 'Brake pad swap',
      caption: 'Quick DIY at Sharma Motors',
      mediaType: 'VIDEO',
      posterUrl: wire.posterUrl,
      authorKind: 'GARAGE',
      authorName: 'Sharma Motors',
      likeCount: 1234,
      publishedAt: '2026-11-01T10:00:00.000Z',
    });
  });

  it('rejects unusable payloads and unsafe poster schemes', () => {
    expect(parsePublicReel(null)).toBeNull();
    expect(parsePublicReel({ data: { ...wire, id: 'nope' } })).toBeNull();
    expect(parsePublicReel({ data: { ...wire, title: ' ' } })).toBeNull();
    expect(
      parsePublicReel({ data: { ...wire, posterUrl: 'javascript:alert(1)' } })?.posterUrl,
    ).toBeNull();
  });
});

describe('fetchPublicReel', () => {
  it('GETs /v1/public/reels/{id} anonymously and returns the reel', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(200, { data: wire })));
    const reel = await fetchPublicReel(ID, { fetchImpl, baseUrl: 'https://api.example/' });
    expect(reel?.title).toBe('Brake pad swap');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit & { next?: unknown },
    ];
    expect(url).toBe(`https://api.example/v1/public/reels/${ID}`);
    expect(init.headers).toEqual({ Accept: 'application/json' });
    expect(init.next).toEqual({ revalidate: 60 });
  });

  it('fresh reads bypass the cache', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(200, { data: wire })));
    await fetchPublicReel(ID, { fetchImpl, baseUrl: 'https://api.example', fresh: true });
    expect((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].cache).toBe('no-store');
  });

  it('returns null for 404, network errors and non-uuid ids (without calling the API)', async () => {
    const notFound = vi.fn(() =>
      Promise.resolve(jsonResponse(404, { error: { code: 'not_found' } })),
    );
    expect(
      await fetchPublicReel(ID, { fetchImpl: notFound, baseUrl: 'https://api.example' }),
    ).toBeNull();
    const broken = vi.fn(() => Promise.reject(new TypeError('fetch failed')));
    expect(
      await fetchPublicReel(ID, { fetchImpl: broken, baseUrl: 'https://api.example' }),
    ).toBeNull();
    const never = vi.fn();
    expect(
      await fetchPublicReel('../admin', { fetchImpl: never, baseUrl: 'https://api.example' }),
    ).toBeNull();
    expect(never).not.toHaveBeenCalled();
  });
});

describe('poster redirect route', () => {
  it('302s to a freshly signed poster URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(200, { data: wire }))),
    );
    const res = await getPoster(new Request(`https://autolokate.com${posterPath(ID)}`), {
      params: Promise.resolve({ id: ID }),
    });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(wire.posterUrl);
    expect(res.headers.get('cache-control')).toBe('public, max-age=60, s-maxage=60');
  });

  it('falls back to the brand image for unknown clips or clips without a poster', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(404, {}))),
    );
    const res = await getPoster(new Request(`https://autolokate.com${posterPath(ID)}`), {
      params: Promise.resolve({ id: ID }),
    });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://autolokate.com/brand_bg_light.png');
  });
});

describe('share metadata', () => {
  const parsed = parsePublicReel({ data: wire });
  if (!parsed) throw new Error('fixture');
  const reel = parsed;

  it('builds Open Graph + Twitter cards with an absolute, stable poster URL', () => {
    const meta = shareMetadata('c', reel, ID, 'https://autolokate.com');
    expect(meta.title).toBe('Brake pad swap — Autolokate');
    expect(meta.alternates?.canonical).toBe(`https://autolokate.com/c/${ID}`);
    expect(meta.openGraph).toMatchObject({
      title: 'Brake pad swap',
      description: 'Quick DIY at Sharma Motors',
      url: `https://autolokate.com/c/${ID}`,
      type: 'video.other',
      images: [
        { url: `https://autolokate.com/api/share/reels/${ID}/poster`, alt: 'Brake pad swap' },
      ],
    });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(JSON.stringify(meta)).not.toContain('X-Amz-Signature');
  });

  it('falls back to a generated description and marks missing clips noindex', () => {
    const meta = shareMetadata(
      'r',
      { ...reel, kind: 'REEL', caption: '' },
      ID,
      'https://autolokate.com',
    );
    expect(meta.description).toBe('Watch this AutoClip by Sharma Motors on Autolokate.');
    expect(shareMetadata('r', null, ID).robots).toEqual({ index: false });
  });

  it('shareOrigin prefers NEXT_PUBLIC_SITE_URL', () => {
    expect(shareOrigin({})).toBe('https://autolokate.com');
    expect(shareOrigin({ NEXT_PUBLIC_SITE_URL: 'https://staging.autolokate.com/' })).toBe(
      'https://staging.autolokate.com',
    );
  });
});

describe('helpers', () => {
  it('formats counts, authors and clamps text', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1234)).toBe('1.2K');
    expect(formatCount(2_000_000)).toBe('2M');
    expect(authorLabel({ authorKind: 'AUTOLOKATE', authorName: null })).toBe('Autolokate');
    expect(authorLabel({ authorKind: 'STORE', authorName: null })).toBe('An Autolokate store');
    expect(clampText('a  b   c', 10)).toBe('a b c');
    expect(clampText('abcdefghijk', 5)).toBe('abcd…');
  });
});
