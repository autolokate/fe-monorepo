import {
  ADMIN_SOS_CALLING_STATES,
  ADMIN_SOS_TERMINAL_STATES,
  type AdminSosCall,
  type AdminSosDetail,
  type AdminSosLocation,
  type AdminSosState,
  type AdminSosSummary,
} from '@autolokate/api-client';

/** Pure SOS console rules (no React, no network) — unit tested in `sos-model.test.ts`. */

export type SosTone = 'critical' | 'calling' | 'review' | 'closed';

type SosStateMeta = { label: string; tone: SosTone; hint: string; rank: number };

/** `rank` orders the live list after `urgent` (lower = more pressing). */
const STATE_META: Record<AdminSosState, SosStateMeta> = {
  USER_NEEDS_HELP: {
    label: 'User needs help',
    tone: 'critical',
    hint: 'User pressed 2 / tapped "I need help" — family + ambulance activated.',
    rank: 0,
  },
  AUTO_ACTIVATED: {
    label: 'Auto-activated',
    tone: 'critical',
    hint: 'No answer / vendor failure / watchdog / another report — family + ambulance activated.',
    rank: 1,
  },
  USER_SAFE_AWAITING_ADMIN: {
    label: 'Safe — awaiting admin',
    tone: 'review',
    hint: 'User said they are safe. Nothing automatic happens — you decide next steps.',
    rank: 2,
  },
  CALLING_USER_1: {
    label: 'Calling user (1/2)',
    tone: 'calling',
    hint: 'Safety call 1 placed — waiting for the user to press 1 or 2.',
    rank: 3,
  },
  CALLING_USER_2: {
    label: 'Calling user (2/2)',
    tone: 'calling',
    hint: 'Safety call 2 placed — no answer auto-activates help.',
    rank: 4,
  },
  WAITING_RETRY: {
    label: 'Waiting to retry',
    tone: 'calling',
    hint: 'Call 1 went unanswered — call 2 in about 30 s.',
    rank: 5,
  },
  CANCELLED: {
    label: 'Cancelled by user',
    tone: 'closed',
    hint: 'The user cancelled the SOS in the app.',
    rank: 6,
  },
  RESOLVED: { label: 'Resolved', tone: 'closed', hint: 'Closed by an operator.', rank: 7 },
};

const UNKNOWN_META: SosStateMeta = { label: 'Unknown', tone: 'review', hint: '', rank: 5 };

export function sosStateMeta(state: string): SosStateMeta {
  const meta = (STATE_META as Record<string, SosStateMeta | undefined>)[state];
  return meta ?? { ...UNKNOWN_META, label: state };
}

export function isSosTerminal(state: string): boolean {
  return (ADMIN_SOS_TERMINAL_STATES as readonly string[]).includes(state);
}

export function isSosCalling(state: string): boolean {
  return (ADMIN_SOS_CALLING_STATES as readonly string[]).includes(state);
}

/** Label for a closed row: resolution beats the bare state. */
export function sosStatusLabel(row: Pick<AdminSosSummary, 'state' | 'resolution'>): string {
  if (row.state === 'RESOLVED' && row.resolution === 'FALSE_ALARM') return 'False alarm';
  return sosStateMeta(row.state).label;
}

/** Urgent first, then open before settled, then by state rank, then newest opened first. */
export function compareSosIncidents(a: AdminSosSummary, b: AdminSosSummary): number {
  if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
  const aOpen = !isSosTerminal(a.state);
  const bOpen = !isSosTerminal(b.state);
  if (aOpen !== bOpen) return aOpen ? -1 : 1;
  const rank = sosStateMeta(a.state).rank - sosStateMeta(b.state).rank;
  if (rank !== 0) return rank;
  return a.openedAt < b.openedAt ? 1 : a.openedAt > b.openedAt ? -1 : 0;
}

export function sortSosIncidents(rows: readonly AdminSosSummary[]): AdminSosSummary[] {
  return [...rows].sort(compareSosIncidents);
}

/** Merge an incremental poll (`updatedSince`) into the current rows — newer `updatedAt` wins. */
export function mergeSosIncidents(
  current: readonly AdminSosSummary[],
  incoming: readonly AdminSosSummary[],
): AdminSosSummary[] {
  const byId = new Map(current.map((row) => [row.incidentId, row]));
  for (const row of incoming) {
    const prev = byId.get(row.incidentId);
    if (!prev || prev.updatedAt <= row.updatedAt) byId.set(row.incidentId, row);
  }
  return sortSosIncidents([...byId.values()]);
}

/** The next `updatedSince` cursor: the max `updatedAt` seen (never moves backwards). */
export function nextSosCursor(
  previous: string | null,
  rows: readonly Pick<AdminSosSummary, 'updatedAt'>[],
): string | null {
  let cursor = previous;
  for (const row of rows) {
    if (!cursor || row.updatedAt > cursor) cursor = row.updatedAt;
  }
  return cursor;
}

/**
 * What deserves the "new incident" cue between two snapshots: an incident never seen before that is
 * still open, or a known one that just turned urgent. The first snapshot (`previous === null`) never
 * cues — opening the page is not news.
 */
export function detectSosAlerts(
  previous: readonly AdminSosSummary[] | null,
  next: readonly AdminSosSummary[],
): string[] {
  if (previous === null) return [];
  const before = new Map(previous.map((row) => [row.incidentId, row]));
  const ids: string[] = [];
  for (const row of next) {
    const prev = before.get(row.incidentId);
    if (!prev) {
      if (!isSosTerminal(row.state)) ids.push(row.incidentId);
    } else if (row.urgent && !prev.urgent) {
      ids.push(row.incidentId);
    }
  }
  return ids;
}

export type SosFilterScope = 'OPEN' | 'NEEDS_ACTION' | 'CALLING' | 'CLOSED' | 'ALL';
export type SosTriggerFilter = 'ANY' | 'SOS' | 'CRASH';

export const SOS_SCOPE_VALUES: readonly SosFilterScope[] = [
  'OPEN',
  'NEEDS_ACTION',
  'CALLING',
  'CLOSED',
  'ALL',
];
export const SOS_TRIGGER_VALUES: readonly SosTriggerFilter[] = ['ANY', 'SOS', 'CRASH'];

/** "Needs action" = an operator should look now (activated, urgent, or safe-awaiting-admin). */
export function needsOperator(row: AdminSosSummary): boolean {
  if (isSosTerminal(row.state)) return false;
  return (
    row.urgent ||
    row.state === 'USER_NEEDS_HELP' ||
    row.state === 'AUTO_ACTIVATED' ||
    row.state === 'USER_SAFE_AWAITING_ADMIN'
  );
}

export function filterSosIncidents(
  rows: readonly AdminSosSummary[],
  filters: { scope: SosFilterScope; trigger: SosTriggerFilter; search: string },
): AdminSosSummary[] {
  const term = filters.search.trim().toLowerCase();
  const digits = term.replace(/\D/g, '');
  return rows.filter((row) => {
    if (filters.trigger !== 'ANY' && row.trigger !== filters.trigger) return false;
    switch (filters.scope) {
      case 'OPEN':
        if (isSosTerminal(row.state)) return false;
        break;
      case 'NEEDS_ACTION':
        if (!needsOperator(row)) return false;
        break;
      case 'CALLING':
        if (!isSosCalling(row.state)) return false;
        break;
      case 'CLOSED':
        if (!isSosTerminal(row.state)) return false;
        break;
      default:
        break;
    }
    if (!term) return true;
    const name = row.subject.name?.toLowerCase() ?? '';
    const phone = row.subject.phone?.replace(/\D/g, '') ?? '';
    return (
      name.includes(term) ||
      (digits.length >= 3 && phone.includes(digits)) ||
      row.incidentId.toLowerCase().startsWith(term)
    );
  });
}

export type SosCounts = { open: number; urgent: number; awaitingAdmin: number; calling: number };

export function countSosIncidents(rows: readonly AdminSosSummary[]): SosCounts {
  const counts: SosCounts = { open: 0, urgent: 0, awaitingAdmin: 0, calling: 0 };
  for (const row of rows) {
    if (isSosTerminal(row.state)) continue;
    counts.open += 1;
    if (row.urgent) counts.urgent += 1;
    if (row.state === 'USER_SAFE_AWAITING_ADMIN') counts.awaitingAdmin += 1;
    if (isSosCalling(row.state)) counts.calling += 1;
  }
  return counts;
}

/** "45s", "3m 05s", "2h 14m", "3d 4h" — elapsed since `fromIso` at `nowMs` (never negative). */
export function formatSosElapsed(fromIso: string, nowMs: number): string {
  const from = Date.parse(fromIso);
  if (Number.isNaN(from)) return '—';
  const total = Math.max(0, Math.floor((nowMs - from) / 1000));
  if (total < 60) return `${String(total)}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${String(minutes)}m ${String(total % 60).padStart(2, '0')}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h ${String(minutes % 60)}m`;
  return `${String(Math.floor(hours / 24))}d ${String(hours % 24)}h`;
}

/** "0:42" countdown to `toMs`; null once it passed. */
export function formatSosCountdown(toMs: number, nowMs: number): string | null {
  const left = Math.ceil((toMs - nowMs) / 1000);
  if (left <= 0) return null;
  return `${String(Math.floor(left / 60))}:${String(left % 60).padStart(2, '0')}`;
}

/** Server timings (docs `SOS_SAFETY_CALLS_API.md` §1): retry gap after call 1, watchdog hard cap. */
export const SOS_RETRY_GAP_MS = 30_000;
export const SOS_WATCHDOG_MS = 4 * 60_000;

export type SosNextStep = {
  label: string;
  /** Epoch ms the step is expected; null when it is due now / unknown. */
  atMs: number | null;
  /** True when derived client-side from call timestamps (the admin DTO has no `nextActionAt`). */
  estimated: boolean;
};

function latestCall(calls: readonly AdminSosCall[]): AdminSosCall | null {
  let best: AdminSosCall | null = null;
  for (const call of calls) {
    if (!best || call.attemptNo > best.attemptNo) best = call;
  }
  return best;
}

/**
 * What happens next while the automatic calls run, and when. The admin DTO carries no
 * `nextActionAt`, so this is derived from the call rows (ring deadline / call-1 end + retry gap),
 * capped by the watchdog (opened + 4 min). Null when nothing automatic is pending.
 */
export function sosNextStep(
  detail: Pick<AdminSosDetail, 'state' | 'calls' | 'openedAt'>,
): SosNextStep | null {
  const watchdog = Date.parse(detail.openedAt) + SOS_WATCHDOG_MS;
  const cap = (atMs: number | null): number | null =>
    atMs === null || Number.isNaN(watchdog) ? atMs : Math.min(atMs, watchdog);
  const call = latestCall(detail.calls);
  switch (detail.state) {
    case 'CALLING_USER_1':
      return {
        label: 'Call 1 rings until — then call 2 is scheduled',
        atMs: cap(call ? Date.parse(call.ringDeadlineAt) : null),
        estimated: true,
      };
    case 'WAITING_RETRY': {
      const ended = call?.endedAt ?? call?.ringDeadlineAt ?? null;
      return {
        label: 'Call 2 is placed in',
        atMs: cap(ended ? Date.parse(ended) + SOS_RETRY_GAP_MS : null),
        estimated: true,
      };
    }
    case 'CALLING_USER_2':
      return {
        label: 'Call 2 rings until — no answer auto-activates help',
        atMs: cap(call ? Date.parse(call.ringDeadlineAt) : null),
        estimated: true,
      };
    default:
      return null;
  }
}

export type SosActionKey = 'notify-family' | 'request-ambulance' | 'call-user' | 'resolve' | 'note';

export type SosActionAvailability = { enabled: boolean; reason: string | null };

/** Mirrors `AdminSosService.applyAction` guards so a disabled button never 409s. */
export function sosActionAvailability(
  row: Pick<AdminSosSummary, 'state' | 'ambulanceReleasedAt'>,
): Record<SosActionKey, SosActionAvailability> {
  const settled = isSosTerminal(row.state);
  const settledReason = settled ? 'This incident is closed.' : null;
  const ok: SosActionAvailability = { enabled: true, reason: null };
  const closed: SosActionAvailability = { enabled: false, reason: settledReason };
  return {
    'notify-family': settled ? closed : ok,
    'request-ambulance': settled
      ? closed
      : row.ambulanceReleasedAt
        ? { enabled: false, reason: 'The ambulance leg is already released.' }
        : ok,
    'call-user': settled
      ? closed
      : isSosCalling(row.state)
        ? { enabled: false, reason: 'The automatic safety calls are still running.' }
        : ok,
    resolve: settled ? closed : ok,
    note: ok,
  };
}

export const SOS_NOTE_MAX = 2000;

export function sosNoteError(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 'Write a note first.';
  if (trimmed.length > SOS_NOTE_MAX) return `At most ${String(SOS_NOTE_MAX)} characters.`;
  return null;
}

/** `tel:` href from a display phone (keeps a leading +, digits only). Null when unusable. */
export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 6) return null;
  return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`;
}

/** `https://wa.me/<digits>` chat link. Null when unusable. */
export function whatsAppHref(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, '') ?? '';
  return digits.length < 8 ? null : `https://wa.me/${digits}`;
}

function coord(value: number): string {
  return value.toFixed(6);
}

export function googleMapsPointHref(point: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/search/?api=1&query=${coord(point.lat)},${coord(point.lng)}`;
}

/** Keyless Google Maps embed (no API key — the classic `output=embed` URL). */
export function googleMapsEmbedSrc(point: { lat: number; lng: number }): string {
  return `https://maps.google.com/maps?q=${coord(point.lat)},${coord(point.lng)}&z=16&output=embed`;
}

/** Directions URL through the trail (first → last, up to 8 evenly spaced waypoints). */
export function googleMapsTrailHref(trail: readonly { lat: number; lng: number }[]): string | null {
  if (trail.length < 2) return null;
  const first = trail[0];
  const last = trail[trail.length - 1];
  if (!first || !last) return null;
  const inner = trail.slice(1, -1);
  const maxWaypoints = 8;
  const step = Math.max(1, Math.ceil(inner.length / maxWaypoints));
  const waypoints = inner.filter((_, index) => index % step === 0).slice(0, maxWaypoints);
  const params = new URLSearchParams({
    api: '1',
    origin: `${coord(first.lat)},${coord(first.lng)}`,
    destination: `${coord(last.lat)},${coord(last.lng)}`,
    travelmode: 'driving',
  });
  if (waypoints.length > 0) {
    params.set('waypoints', waypoints.map((p) => `${coord(p.lat)},${coord(p.lng)}`).join('|'));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** The live trail, falling back to the alert's raise-time location when no ping arrived yet. */
export function sosTrail(detail: Pick<AdminSosDetail, 'locations' | 'alerts'>): AdminSosLocation[] {
  if (detail.locations.length > 0) return detail.locations;
  const out: AdminSosLocation[] = [];
  for (const alert of detail.alerts) {
    if (alert.location) out.push({ ...alert.location, recordedAt: alert.createdAt });
  }
  return out;
}

/** Project a trail into an SVG viewBox (equirectangular, aspect-preserving, padded). */
export function projectSosTrail(
  trail: readonly { lat: number; lng: number }[],
  size: { width: number; height: number; padding: number },
): { x: number; y: number }[] {
  if (trail.length === 0) return [];
  const lats = trail.map((p) => p.lat);
  const lngs = trail.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const spanX = Math.max((maxLng - minLng) * Math.cos(midLat), 1e-6);
  const spanY = Math.max(maxLat - minLat, 1e-6);
  const innerW = size.width - size.padding * 2;
  const innerH = size.height - size.padding * 2;
  const scale = Math.min(innerW / spanX, innerH / spanY);
  const offsetX = size.padding + (innerW - spanX * scale) / 2;
  const offsetY = size.padding + (innerH - spanY * scale) / 2;
  return trail.map((p) => ({
    x: offsetX + (p.lng - minLng) * Math.cos(midLat) * scale,
    y: offsetY + (maxLat - p.lat) * scale,
  }));
}

const TIMELINE_LABELS: Record<string, string> = {
  OPENED: 'SOS opened',
  CALL_1_PLACED: 'Safety call 1 placed',
  CALL_1_UNANSWERED: 'Call 1 unanswered',
  CALL_2_PLACED: 'Safety call 2 placed',
  CALL_2_UNANSWERED: 'Call 2 unanswered',
  USER_SAFE: 'User said they are safe',
  USER_NEEDS_HELP: 'User needs help',
  AMBULANCE_RELEASED: 'Ambulance released',
  FAMILY_NOTIFYING: 'Family being notified',
  ADMIN_NOTIFY_FAMILY: 'Operator notified family',
  ADMIN_CALL_REQUESTED: 'Operator requested a call',
  NOTE: 'Operator note',
  CANCELLED: 'Cancelled by user',
  RESOLVED: 'Resolved',
  FALSE_ALARM: 'Marked false alarm',
  WATCHDOG_ACTIVATED: 'Watchdog auto-activated help',
};

export function sosTimelineLabel(type: string): string {
  return (
    TIMELINE_LABELS[type] ??
    type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^./, (c) => c.toUpperCase())
  );
}

/** Human outcome of one safety call. */
export function sosCallOutcome(call: Pick<AdminSosCall, 'status' | 'dtmf'>): string {
  if (call.status === 'ANSWERED') {
    if (call.dtmf === '1') return 'Answered — pressed 1 (safe)';
    if (call.dtmf === '2') return 'Answered — pressed 2 (needs help)';
    return 'Answered — no choice';
  }
  switch (call.status) {
    case 'REQUESTED':
      return 'Placed — waiting for report';
    case 'RINGING':
      return 'Ringing';
    case 'NO_ANSWER':
      return 'No answer';
    case 'BUSY':
      return 'Busy';
    case 'FAILED':
      return 'Could not connect';
    default:
      return call.status;
  }
}

const ACTIVATION_REASONS: Record<string, string> = {
  NO_ANSWER: 'No answer to both calls',
  USER_NEEDS_HELP: 'User asked for help',
  VENDOR_FAILURE: 'Call could not be placed',
  WATCHDOG: 'Watchdog hard cap',
  OTHER_REPORT: 'Another person reported it',
};

export function sosActivationReason(reason: string | null): string | null {
  if (!reason) return null;
  return ACTIVATION_REASONS[reason] ?? reason;
}
