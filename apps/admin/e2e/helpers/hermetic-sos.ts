import type { Page, Route } from '@playwright/test';

/** Hermetic SOS console API (`/admin/v1/sos-incidents`). Synthetic people + numbers only. */

const META = { requestId: 'hermetic-req', correlationId: 'hermetic-corr' };

export const SOS_URGENT_ID = 'a0a0a0a0-0000-4000-8000-000000000001';
export const SOS_SAFE_ID = 'a0a0a0a0-0000-4000-8000-000000000002';
export const SOS_CALLING_ID = 'a0a0a0a0-0000-4000-8000-000000000003';
export const SOS_NEW_ID = 'a0a0a0a0-0000-4000-8000-000000000004';

type Row = Record<string, unknown> & {
  incidentId: string;
  state: string;
  urgent: boolean;
  updatedAt: string;
};

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function summary(overrides: Partial<Row> & { incidentId: string }): Row {
  return {
    alertId: `${overrides.incidentId.slice(0, -1)}9`,
    trigger: 'SOS',
    state: 'CALLING_USER_1',
    urgent: false,
    subject: { accountId: 'acc-hermetic', name: 'Hermetic Rider', phone: '+910000000101' },
    vehicleId: null,
    userResponse: null,
    userResponseChannel: null,
    activationReason: null,
    ambulanceReleasedAt: null,
    familyNotifiedRounds: 0,
    lastCall: null,
    openedAt: iso(-120_000),
    updatedAt: iso(-60_000),
    resolution: null,
    ...overrides,
  };
}

function detailOf(row: Row): Record<string, unknown> {
  const opened = String(row.openedAt);
  return {
    ...row,
    incident: { source: 'APP', openedAt: opened, resolvedAt: null, suspectedFalseAlarm: false },
    alerts: [
      {
        alertId: row.alertId,
        status: 'RECEIVED',
        dispatchPath: 'FULL',
        reporterAccountId: null,
        createdAt: opened,
        location: { lat: 19.07, lng: 72.87, accuracyM: 25 },
      },
    ],
    locations: [
      { lat: 19.07, lng: 72.87, accuracyM: 25, recordedAt: iso(-110_000) },
      { lat: 19.0712, lng: 72.8714, accuracyM: 15, recordedAt: iso(-60_000) },
      { lat: 19.0721, lng: 72.8732, accuracyM: 12, recordedAt: iso(-15_000) },
    ],
    vehicles: [
      {
        vehicleId: 'veh-hermetic',
        role: 'OWNER',
        plate: 'MH01HE0001',
        make: 'Hermetic',
        model: 'Creta',
        color: 'White',
        isIncidentVehicle: true,
      },
    ],
    contacts: [
      {
        contactId: 'c1',
        name: 'Hermetic Sister',
        phone: '+910000000202',
        relation: 'SIBLING',
        notifications: [
          {
            round: 1,
            voiceStatus: 'NO_ANSWER',
            whatsappStatus: 'SENT',
            failureReason: null,
            at: iso(-30_000),
          },
        ],
      },
    ],
    crash: [],
    calls:
      row.state === 'CALLING_USER_1'
        ? [
            {
              attemptNo: 1,
              status: 'RINGING',
              dtmf: null,
              provider: 'MSG91',
              failureReason: null,
              durationS: null,
              initiatedByAdminId: null,
              requestedAt: iso(-5_000),
              ringDeadlineAt: iso(35_000),
              endedAt: null,
            },
          ]
        : [
            {
              attemptNo: 1,
              status: 'ANSWERED',
              dtmf: '1',
              provider: 'MSG91',
              failureReason: null,
              durationS: 12,
              initiatedByAdminId: null,
              requestedAt: iso(-115_000),
              ringDeadlineAt: iso(-75_000),
              endedAt: iso(-100_000),
            },
          ],
    timeline: [
      { type: 'OPENED', actor: 'SYSTEM', actorAdminId: null, detail: null, note: null, at: opened },
      ...((row.notes as Record<string, unknown>[] | undefined) ?? []),
    ],
    dispatchSteps: [],
  };
}

export type HermeticSosCapture = {
  listQueries: URLSearchParams[];
  detailReads: number;
  actions: { path: string; body: unknown }[];
  /** Add a new open incident to the server state (picked up by the next poll). */
  addNewIncident: () => void;
};

async function json(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

export async function installHermeticSosRoutes(
  page: Page,
  options: {
    actionError?: { status: number; code: string; message: string; details?: unknown };
  } = {},
): Promise<HermeticSosCapture> {
  const rows = new Map<string, Row>([
    [
      SOS_SAFE_ID,
      summary({
        incidentId: SOS_SAFE_ID,
        state: 'USER_SAFE_AWAITING_ADMIN',
        userResponse: 'SAFE',
        userResponseChannel: 'DTMF',
        subject: { accountId: 'acc-safe', name: 'Hermetic Safe Rider', phone: '+910000000102' },
        openedAt: iso(-300_000),
      }),
    ],
    [
      SOS_CALLING_ID,
      summary({
        incidentId: SOS_CALLING_ID,
        trigger: 'CRASH',
        state: 'CALLING_USER_1',
        subject: { accountId: 'acc-crash', name: 'Hermetic Crash Driver', phone: '+910000000103' },
        lastCall: { attemptNo: 1, status: 'RINGING', at: iso(-5_000) },
        openedAt: iso(-10_000),
      }),
    ],
    [
      SOS_URGENT_ID,
      summary({
        incidentId: SOS_URGENT_ID,
        state: 'AUTO_ACTIVATED',
        urgent: true,
        activationReason: 'NO_ANSWER',
        ambulanceReleasedAt: iso(-20_000),
        familyNotifiedRounds: 1,
        subject: { accountId: 'acc-urgent', name: 'Hermetic Urgent Rider', phone: '+910000000101' },
        lastCall: { attemptNo: 2, status: 'NO_ANSWER', at: iso(-25_000) },
        openedAt: iso(-180_000),
      }),
    ],
  ]);

  const capture: HermeticSosCapture = {
    listQueries: [],
    detailReads: 0,
    actions: [],
    addNewIncident: () => {
      rows.set(
        SOS_NEW_ID,
        summary({
          incidentId: SOS_NEW_ID,
          state: 'CALLING_USER_1',
          subject: { accountId: 'acc-new', name: 'Hermetic Newest Rider', phone: '+910000000104' },
          openedAt: iso(0),
          updatedAt: iso(0),
        }),
      );
    },
  };

  const touch = (row: Row, patch: Partial<Row>) => {
    const next = { ...row, ...patch, updatedAt: new Date().toISOString() };
    rows.set(row.incidentId, next);
    return next;
  };

  const publicRow = (row: Row) => {
    const { notes: _notes, ...rest } = row;
    return rest;
  };

  await page.route('https://maps.google.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>map</body></html>' }),
  );

  // Safety alerts (crash review feed) on the console — none by default.
  await page.route(
    (url) => url.pathname.startsWith('/admin/v1/drivequant/ops-alerts'),
    (route) => json(route, 200, { data: [], meta: META }),
  );

  await page.route(/\/admin\/v1\/sos-incidents/, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    if (req.method() === 'GET' && path === '/admin/v1/sos-incidents') {
      capture.listQueries.push(url.searchParams);
      const since = url.searchParams.get('updatedSince');
      const out = [...rows.values()].filter((row) => !since || row.updatedAt > since);
      await json(route, 200, { data: out.map(publicRow), meta: META });
      return;
    }
    const detail = path.match(/^\/admin\/v1\/sos-incidents\/([^/]+)$/);
    if (req.method() === 'GET' && detail) {
      capture.detailReads += 1;
      const row = rows.get(decodeURIComponent(detail[1] ?? ''));
      if (!row) {
        await json(route, 404, { error: { code: 'not_found', message: 'No such SOS incident.' } });
        return;
      }
      await json(route, 200, { data: detailOf(row), meta: META });
      return;
    }
    const action = path.match(/^\/admin\/v1\/sos-incidents\/([^/]+)\/(actions\/[a-z-]+|notes)$/);
    if (req.method() === 'POST' && action) {
      const id = decodeURIComponent(action[1] ?? '');
      const kind = action[2] ?? '';
      const body = req.postDataJSON() as unknown;
      capture.actions.push({ path: kind, body });
      const row = rows.get(id);
      if (!row) {
        await json(route, 404, { error: { code: 'not_found', message: 'No such SOS incident.' } });
        return;
      }
      if (options.actionError) {
        const { status, code, message, details } = options.actionError;
        await json(route, status, { error: { code, message, details } });
        return;
      }
      let next = row;
      if (kind === 'actions/notify-family') {
        next = touch(row, { familyNotifiedRounds: Number(row.familyNotifiedRounds) + 1 });
      } else if (kind === 'actions/request-ambulance') {
        next = touch(row, { ambulanceReleasedAt: new Date().toISOString() });
      } else if (kind === 'actions/call-user') {
        next = touch(row, { state: 'CALLING_USER_1' });
      } else if (kind === 'actions/resolve') {
        const outcome = (body as { outcome?: string }).outcome ?? 'RESOLVED';
        next = touch(row, { state: 'RESOLVED', urgent: false, resolution: outcome });
      } else if (kind === 'notes') {
        const text = (body as { text?: string }).text ?? '';
        const notes = [...((row.notes as unknown[] | undefined) ?? [])];
        notes.push({
          type: 'NOTE',
          actor: 'ADMIN',
          actorAdminId: 'hermetic-admin',
          detail: null,
          note: text,
          at: new Date().toISOString(),
        });
        next = touch(row, { notes });
      }
      await json(route, 200, { data: publicRow(next), meta: META });
      return;
    }
    await json(route, 404, {
      error: { code: 'not_found', message: `Cannot ${req.method()} ${path}` },
    });
  });

  return capture;
}
