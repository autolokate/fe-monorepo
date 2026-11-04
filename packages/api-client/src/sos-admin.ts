import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/**
 * Admin SOS console — `/admin/v1/sos-incidents` (be-monorepo `AdminSosController`, OPERATOR · admin
 * plane · step_up). Live emergencies are NOT behind break-glass dual control: every read is audited
 * server-side as `INCIDENT_PII_ACCESS`, every action as `SOS_ADMIN_ACTION`.
 */

/** `safety_escalation_state` — the safety-call escalation lifecycle. */
export const ADMIN_SOS_STATES = [
  'CALLING_USER_1',
  'WAITING_RETRY',
  'CALLING_USER_2',
  'USER_SAFE_AWAITING_ADMIN',
  'USER_NEEDS_HELP',
  'AUTO_ACTIVATED',
  'CANCELLED',
  'RESOLVED',
] as const;
export type AdminSosState = (typeof ADMIN_SOS_STATES)[number];

/** States where the automatic safety calls are still running (server `CALLING_STATES`). */
export const ADMIN_SOS_CALLING_STATES: readonly AdminSosState[] = [
  'CALLING_USER_1',
  'WAITING_RETRY',
  'CALLING_USER_2',
];

/** Settled states — no action but a note is accepted (server `TERMINAL_STATES`). */
export const ADMIN_SOS_TERMINAL_STATES: readonly AdminSosState[] = ['CANCELLED', 'RESOLVED'];

export type AdminSosTrigger = 'SOS' | 'CRASH';
export type AdminSosCallStatus =
  | 'REQUESTED'
  | 'RINGING'
  | 'ANSWERED'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'FAILED';
export type AdminSosResolution = 'RESOLVED' | 'FALSE_ALARM';

export type AdminSosSubject = {
  accountId: string;
  name: string | null;
  /** E.164 login phone. */
  phone: string | null;
};

export type AdminSosLastCall = {
  attemptNo: number;
  /** {@link AdminSosCallStatus} (kept open for forward-compatible values). */
  status: string;
  at: string;
};

/** `AdminSosSummaryDto` — one list row (also the response of every action). */
export type AdminSosSummary = {
  incidentId: string;
  alertId: string;
  /** {@link AdminSosTrigger} */
  trigger: string;
  /** {@link AdminSosState} */
  state: string;
  /** USER_NEEDS_HELP, or auto-activated without a SAFE answer. */
  urgent: boolean;
  subject: AdminSosSubject;
  vehicleId: string | null;
  userResponse: 'SAFE' | 'NEED_HELP' | null;
  userResponseChannel: 'DTMF' | 'APP' | null;
  /** NO_ANSWER | USER_NEEDS_HELP | VENDOR_FAILURE | WATCHDOG | OTHER_REPORT */
  activationReason: string | null;
  ambulanceReleasedAt: string | null;
  familyNotifiedRounds: number;
  lastCall: AdminSosLastCall | null;
  openedAt: string;
  updatedAt: string;
  resolution: AdminSosResolution | null;
};

export type AdminSosGeo = { lat: number; lng: number; accuracyM: number | null };
export type AdminSosLocation = AdminSosGeo & { recordedAt: string };

export type AdminSosAlert = {
  alertId: string;
  status: string;
  dispatchPath: string;
  reporterAccountId: string | null;
  createdAt: string;
  location: AdminSosGeo | null;
};

export type AdminSosVehicle = {
  vehicleId: string;
  /** OWNER | PROVISIONAL_OWNER | DRIVER | INCIDENT_VEHICLE */
  role: string;
  plate: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  isIncidentVehicle: boolean;
};

export type AdminSosContactNotification = {
  round: number;
  voiceStatus: string | null;
  whatsappStatus: 'SENT' | 'FAILED' | 'SKIPPED' | null;
  failureReason: string | null;
  at: string;
};

export type AdminSosContact = {
  contactId: string;
  name: string;
  phone: string;
  relation: string | null;
  notifications: AdminSosContactNotification[];
};

export type AdminSosCrash = {
  crashId: string;
  state: string;
  probability: number | null;
  crashAt: string | null;
  outcome: string;
};

export type AdminSosCall = {
  attemptNo: number;
  /** {@link AdminSosCallStatus} (kept open for forward-compatible values). */
  status: string;
  dtmf: string | null;
  /** MSG91 | LOG */
  provider: string;
  failureReason: string | null;
  durationS: number | null;
  initiatedByAdminId: string | null;
  requestedAt: string;
  ringDeadlineAt: string;
  endedAt: string | null;
};

export type AdminSosTimelineEvent = {
  type: string;
  /** SYSTEM | USER | VENDOR | ADMIN */
  actor: string;
  actorAdminId: string | null;
  detail: Record<string, unknown> | null;
  note: string | null;
  at: string;
};

export type AdminSosDispatchStep = {
  alertId: string;
  step: string;
  state: string;
  detail: Record<string, unknown> | null;
  at: string;
};

export type AdminSosIncidentInfo = {
  source: string;
  openedAt: string;
  resolvedAt: string | null;
  suspectedFalseAlarm: boolean;
};

/** `AdminSosDetailDto` — summary + the full operator view. */
export type AdminSosDetail = AdminSosSummary & {
  incident: AdminSosIncidentInfo;
  alerts: AdminSosAlert[];
  /** Live trail, oldest first. */
  locations: AdminSosLocation[];
  vehicles: AdminSosVehicle[];
  contacts: AdminSosContact[];
  crash: AdminSosCrash[];
  calls: AdminSosCall[];
  timeline: AdminSosTimelineEvent[];
  dispatchSteps: AdminSosDispatchStep[];
};

export type ListAdminSosIncidentsQuery = {
  states?: readonly AdminSosState[];
  /** Only escalations updated strictly after this instant (ISO). */
  updatedSince?: string;
  /** 1..100 (server default 50). */
  limit?: number;
};

export type AdminSosAction = 'notify-family' | 'request-ambulance' | 'call-user';

type RequestOptions = { signal?: AbortSignal };

function signalOf(options: RequestOptions): { signal?: AbortSignal } {
  return options.signal ? { signal: options.signal } : {};
}

/** GET /admin/v1/sos-incidents?state=&updatedSince=&limit= — open escalations first, newest first. */
export async function listAdminSosIncidents(
  client: ApiClient,
  query: ListAdminSosIncidentsQuery = {},
  options: RequestOptions = {},
): Promise<AdminSosSummary[]> {
  const search = new URLSearchParams();
  if (query.states && query.states.length > 0) search.set('state', query.states.join(','));
  if (query.updatedSince) search.set('updatedSince', query.updatedSince);
  if (query.limit !== undefined) search.set('limit', String(query.limit));
  const qs = search.toString();
  const response = await client.get<unknown>(
    `${endpoints.admin.adminSosIncidents}${qs ? `?${qs}` : ''}`,
    signalOf(options),
  );
  return unwrapEnvelope(response) as AdminSosSummary[];
}

/** GET /admin/v1/sos-incidents/{incidentId} — full detail (audited PII read). */
export async function getAdminSosIncident(
  client: ApiClient,
  incidentId: string,
  options: RequestOptions = {},
): Promise<AdminSosDetail> {
  const response = await client.get<unknown>(
    endpoints.admin.adminSosIncident(incidentId),
    signalOf(options),
  );
  return unwrapEnvelope(response) as AdminSosDetail;
}

/** POST …/actions/{notify-family|request-ambulance|call-user} — returns the refreshed summary. */
export async function runAdminSosAction(
  client: ApiClient,
  incidentId: string,
  action: AdminSosAction,
  options: RequestOptions = {},
): Promise<AdminSosSummary> {
  const response = await client.post<unknown>(
    `${endpoints.admin.adminSosIncident(incidentId)}/actions/${action}`,
    undefined,
    signalOf(options),
  );
  return unwrapEnvelope(response) as AdminSosSummary;
}

/** POST …/actions/resolve `{ outcome }` — closes the incident + escalation. */
export async function resolveAdminSosIncident(
  client: ApiClient,
  incidentId: string,
  outcome: AdminSosResolution,
  options: RequestOptions = {},
): Promise<AdminSosSummary> {
  const response = await client.post<unknown>(
    `${endpoints.admin.adminSosIncident(incidentId)}/actions/resolve`,
    { outcome },
    signalOf(options),
  );
  return unwrapEnvelope(response) as AdminSosSummary;
}

/** POST …/notes `{ text }` (1..2000, encrypted at rest). */
export async function addAdminSosNote(
  client: ApiClient,
  incidentId: string,
  text: string,
  options: RequestOptions = {},
): Promise<AdminSosSummary> {
  const response = await client.post<unknown>(
    `${endpoints.admin.adminSosIncident(incidentId)}/notes`,
    { text },
    signalOf(options),
  );
  return unwrapEnvelope(response) as AdminSosSummary;
}
