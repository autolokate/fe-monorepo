import {
  addAdminSosNote,
  getAdminSosIncident,
  listAdminSosIncidents,
  resolveAdminSosIncident,
  runAdminSosAction,
  type AdminSosAction,
  type AdminSosDetail,
  type AdminSosResolution,
  type AdminSosSummary,
  type ListAdminSosIncidentsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** Server max page size for `GET /admin/v1/sos-incidents`. */
export const SOS_LIST_LIMIT = 100;

/** GET /admin/v1/sos-incidents — every call is audited server-side (`INCIDENT_PII_ACCESS`). */
export function fetchSosIncidents(
  query: ListAdminSosIncidentsQuery,
  signal?: AbortSignal,
): Promise<AdminSosSummary[]> {
  return listAdminSosIncidents(getAdminApiClient(), query, signal ? { signal } : {});
}

/** GET /admin/v1/sos-incidents/{id} — audited PII read. */
export function fetchSosIncident(
  incidentId: string,
  signal?: AbortSignal,
): Promise<AdminSosDetail> {
  return getAdminSosIncident(getAdminApiClient(), incidentId, signal ? { signal } : {});
}

export type SosOperatorAction =
  | { kind: 'notify-family' }
  | { kind: 'request-ambulance' }
  | { kind: 'call-user' }
  | { kind: 'resolve'; outcome: AdminSosResolution }
  | { kind: 'note'; text: string };

/** Runs one operator action (audited `SOS_ADMIN_ACTION`); returns the refreshed summary row. */
export function runSosOperatorAction(
  incidentId: string,
  action: SosOperatorAction,
): Promise<AdminSosSummary> {
  const client = getAdminApiClient();
  switch (action.kind) {
    case 'resolve':
      return resolveAdminSosIncident(client, incidentId, action.outcome);
    case 'note':
      return addAdminSosNote(client, incidentId, action.text);
    default:
      return runAdminSosAction(client, incidentId, action.kind satisfies AdminSosAction);
  }
}
