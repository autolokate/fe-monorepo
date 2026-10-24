import {
  getAdminIncident,
  listAdminIncidentsPage,
  type AdminIncidentDetail,
  type AdminIncidentsPageResult,
  type ListAdminIncidentsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/**
 * GET /admin/v1/incidents — break-glass list. Requires a consumed dual-control `approvalId`
 * (scope INCIDENT_LIST). Every call is audited as `INCIDENT_PII_ACCESS`.
 */
export async function fetchIncidentsPage(
  query: ListAdminIncidentsQuery,
  signal?: AbortSignal,
): Promise<AdminIncidentsPageResult> {
  return listAdminIncidentsPage(getAdminApiClient(), query, { signal });
}

/**
 * GET /admin/v1/incidents/{incidentId} — full break-glass PII view.
 * Requires a consumed dual-control `approvalId` scoped to INCIDENT_DETAIL:<incidentId>.
 */
export async function fetchIncident(
  incidentId: string,
  approvalId: string,
  signal?: AbortSignal,
): Promise<AdminIncidentDetail> {
  return getAdminIncident(getAdminApiClient(), incidentId, approvalId, { signal });
}
