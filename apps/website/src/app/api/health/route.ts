export const dynamic = 'force-dynamic';

/** Liveness probe for the reverse proxy's blue/green health check (infra/staging/Caddyfile). */
export function GET() {
  return Response.json({ status: 'ok' });
}
