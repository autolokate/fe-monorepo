import { ADMIN_NAV_GROUPS, adminRoutes, type AdminRouteMeta } from '@/app/routes/admin-paths';

export type AdminCrumb = { label: string; to?: string };

/**
 * The nav route that owns a pathname: exact match first, then the longest route prefix
 * (`/taxi/bookings/abc` → Taxi bookings). Never matches `/` as a prefix.
 */
export function matchAdminRoute(pathname: string): AdminRouteMeta | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const exact = adminRoutes.find((route) => route.path === clean);
  if (exact) return exact;
  let best: AdminRouteMeta | null = null;
  for (const route of adminRoutes) {
    if (route.path === '/' || !clean.startsWith(`${route.path}/`)) continue;
    if (!best || route.path.length > best.path.length) best = route;
  }
  return best;
}

/** Section › Page › Detail breadcrumbs for the header, derived from the route table only. */
export function buildAdminBreadcrumbs(pathname: string): AdminCrumb[] {
  const route = matchAdminRoute(pathname);
  if (!route) return [];
  const group = ADMIN_NAV_GROUPS.find((entry) => entry.id === route.group);
  const crumbs: AdminCrumb[] = [];
  if (group) crumbs.push({ label: group.label });
  const clean = pathname.replace(/\/+$/, '');
  const isDetail = clean !== route.path;
  crumbs.push(isDetail ? { label: route.label, to: route.path } : { label: route.label });
  if (isDetail) crumbs.push({ label: 'Detail' });
  return crumbs;
}
