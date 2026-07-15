import {
  getAdminIncident,
  listAdminIncidentsPage,
  type AdminIncidentDetail,
  type AdminIncidentsPageResult,
  type ListAdminIncidentsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/**
 * GET /admin/v1/incidents — the break-glass incident list. Read-only, but EVERY call is audited server-side
 * as `INCIDENT_PII_ACCESS` (14-roles §14.6 · security.md § Break-glass), so it is fetched deliberately, never
 * eagerly polled.
 */
export async function fetchIncidentsPage(
  query: ListAdminIncidentsQuery = {},
  signal?: AbortSignal,
): Promise<AdminIncidentsPageResult> {
  return listAdminIncidentsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/incidents/{incidentId} — the full break-glass PII view (also audited `INCIDENT_PII_ACCESS`). */
export async function fetchIncident(
  incidentId: string,
  signal?: AbortSignal,
): Promise<AdminIncidentDetail> {
  return getAdminIncident(getAdminApiClient(), incidentId, { signal });
}
