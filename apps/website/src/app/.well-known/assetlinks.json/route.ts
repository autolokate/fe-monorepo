import { buildAssetLinks, WELL_KNOWN_HEADERS } from '@/lib/app-links/config';

// Runtime env (APP_LINKS_ANDROID_*) — evaluated per request, never baked at build time.
export const dynamic = 'force-dynamic';

/** Android App Links: Digital Asset Links statements (200, application/json, no redirect). */
export function GET() {
  return new Response(JSON.stringify(buildAssetLinks()), {
    status: 200,
    headers: WELL_KNOWN_HEADERS,
  });
}
