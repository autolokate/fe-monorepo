import type { AdminIncidentStatus } from '@autolokate/api-client';

export type IncidentsStatusFilter = AdminIncidentStatus | 'ALL';

export type IncidentsStatusFilterOption = {
  value: IncidentsStatusFilter;
  label: string;
};

/** Status filters from OpenAPI `GET /admin/v1/incidents` `status` query parameter (derived OPEN/RESOLVED). */
export const INCIDENTS_STATUS_FILTERS: IncidentsStatusFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export function toIncidentsQueryStatus(
  filter: IncidentsStatusFilter,
): AdminIncidentStatus | undefined {
  return filter === 'ALL' ? undefined : filter;
}
