import { buildAppleAppSiteAssociation, WELL_KNOWN_HEADERS } from '@/lib/app-links/config';

// Runtime env (APP_LINKS_IOS_APP_IDS) — evaluated per request, never baked at build time.
export const dynamic = 'force-dynamic';

/** iOS universal links: served directly (200, application/json, no redirect, no extension). */
export function GET() {
  return new Response(JSON.stringify(buildAppleAppSiteAssociation()), {
    status: 200,
    headers: WELL_KNOWN_HEADERS,
  });
}
