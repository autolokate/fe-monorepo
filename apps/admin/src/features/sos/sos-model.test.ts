import { describe, expect, it } from 'vitest';

import {
  countSosIncidents,
  detectSosAlerts,
  filterSosIncidents,
  formatSosCountdown,
  formatSosElapsed,
  googleMapsTrailHref,
  mergeSosIncidents,
  nextSosCursor,
  projectSosTrail,
  sortSosIncidents,
  sosActionAvailability,
  sosCallOutcome,
  sosNextStep,
  sosNoteError,
  sosStatusLabel,
  sosTrail,
  telHref,
  whatsAppHref,
} from '@/features/sos/sos-model';
import { sosDetail, sosRow } from '@/features/sos/sos-test-fixtures';

describe('sortSosIncidents', () => {
  it('puts urgent first, then open before closed, then state rank, then newest', () => {
    const rows = [
      sosRow({ incidentId: 'resolved', state: 'RESOLVED', openedAt: '2026-11-05T12:00:00Z' }),
      sosRow({ incidentId: 'safe', state: 'USER_SAFE_AWAITING_ADMIN' }),
      sosRow({ incidentId: 'call-old', state: 'CALLING_USER_1', openedAt: '2026-11-05T09:00:00Z' }),
      sosRow({ incidentId: 'call-new', state: 'CALLING_USER_1', openedAt: '2026-11-05T11:00:00Z' }),
      sosRow({ incidentId: 'urgent', state: 'AUTO_ACTIVATED', urgent: true }),
    ];
    expect(sortSosIncidents(rows).map((r) => r.incidentId)).toEqual([
      'urgent',
      'safe',
      'call-new',
      'call-old',
      'resolved',
    ]);
  });
});

describe('mergeSosIncidents / nextSosCursor', () => {
  it('keeps the newer update and adds new incidents', () => {
    const merged = mergeSosIncidents(
      [sosRow({ incidentId: 'a', updatedAt: '2026-11-05T10:00:05Z' })],
      [
        sosRow({ incidentId: 'a', state: 'WAITING_RETRY', updatedAt: '2026-11-05T10:00:45Z' }),
        sosRow({ incidentId: 'b', updatedAt: '2026-11-05T10:01:00Z' }),
      ],
    );
    expect(merged.find((r) => r.incidentId === 'a')?.state).toBe('WAITING_RETRY');
    expect(merged).toHaveLength(2);
  });

  it('ignores a stale row', () => {
    const merged = mergeSosIncidents(
      [sosRow({ incidentId: 'a', state: 'RESOLVED', updatedAt: '2026-11-05T10:05:00Z' })],
      [sosRow({ incidentId: 'a', state: 'CALLING_USER_2', updatedAt: '2026-11-05T10:01:00Z' })],
    );
    expect(merged[0]?.state).toBe('RESOLVED');
  });

  it('advances the cursor to the max updatedAt and never backwards', () => {
    expect(nextSosCursor(null, [])).toBeNull();
    expect(
      nextSosCursor('2026-11-05T10:00:10Z', [
        sosRow({ updatedAt: '2026-11-05T10:00:05Z' }),
        sosRow({ updatedAt: '2026-11-05T10:00:30Z' }),
      ]),
    ).toBe('2026-11-05T10:00:30Z');
    expect(
      nextSosCursor('2026-11-05T10:00:10Z', [sosRow({ updatedAt: '2026-11-05T09:00:00Z' })]),
    ).toBe('2026-11-05T10:00:10Z');
  });
});

describe('detectSosAlerts', () => {
  it('never cues on the first snapshot', () => {
    expect(detectSosAlerts(null, [sosRow()])).toEqual([]);
  });

  it('cues new open incidents and rows that just turned urgent, not new closed ones', () => {
    const before = [sosRow({ incidentId: 'a' })];
    const after = [
      sosRow({ incidentId: 'a', urgent: true, state: 'AUTO_ACTIVATED' }),
      sosRow({ incidentId: 'b' }),
      sosRow({ incidentId: 'c', state: 'RESOLVED' }),
    ];
    expect(detectSosAlerts(before, after)).toEqual(['a', 'b']);
  });
});

describe('filterSosIncidents / countSosIncidents', () => {
  const rows = [
    sosRow({ incidentId: 'a1', state: 'CALLING_USER_2', trigger: 'CRASH' }),
    sosRow({ incidentId: 'b1', state: 'USER_SAFE_AWAITING_ADMIN' }),
    sosRow({
      incidentId: 'c1',
      state: 'AUTO_ACTIVATED',
      urgent: true,
      subject: { accountId: 'x', name: 'Ravi Kumar', phone: '+91 99999 12345' },
    }),
    sosRow({ incidentId: 'd1', state: 'CANCELLED' }),
  ];
  const base = { scope: 'ALL', trigger: 'ANY', search: '' } as const;

  it('scopes', () => {
    const ids = (scope: Parameters<typeof filterSosIncidents>[1]['scope']) =>
      filterSosIncidents(rows, { ...base, scope }).map((r) => r.incidentId);
    expect(ids('OPEN')).toEqual(['a1', 'b1', 'c1']);
    expect(ids('NEEDS_ACTION')).toEqual(['b1', 'c1']);
    expect(ids('CALLING')).toEqual(['a1']);
    expect(ids('CLOSED')).toEqual(['d1']);
  });

  it('filters by trigger and searches name, phone digits and id prefix', () => {
    expect(
      filterSosIncidents(rows, { ...base, trigger: 'CRASH' }).map((r) => r.incidentId),
    ).toEqual(['a1']);
    expect(filterSosIncidents(rows, { ...base, search: 'ravi' })).toHaveLength(1);
    expect(filterSosIncidents(rows, { ...base, search: '12345' })).toHaveLength(1);
    expect(filterSosIncidents(rows, { ...base, search: 'd1' })).toHaveLength(1);
  });

  it('counts only open incidents', () => {
    expect(countSosIncidents(rows)).toEqual({ open: 3, urgent: 1, awaitingAdmin: 1, calling: 1 });
  });
});

describe('sosActionAvailability', () => {
  it('mirrors the server guards', () => {
    const calling = sosActionAvailability({ state: 'CALLING_USER_1', ambulanceReleasedAt: null });
    expect(calling['call-user'].enabled).toBe(false);
    expect(calling['notify-family'].enabled).toBe(true);
    expect(calling.resolve.enabled).toBe(true);

    const safe = sosActionAvailability({
      state: 'USER_SAFE_AWAITING_ADMIN',
      ambulanceReleasedAt: null,
    });
    expect(Object.values(safe).every((a) => a.enabled)).toBe(true);

    const released = sosActionAvailability({
      state: 'AUTO_ACTIVATED',
      ambulanceReleasedAt: '2026-11-05T10:02:00Z',
    });
    expect(released['request-ambulance'].enabled).toBe(false);

    for (const state of ['RESOLVED', 'CANCELLED']) {
      const closed = sosActionAvailability({ state, ambulanceReleasedAt: null });
      expect(closed.note.enabled).toBe(true);
      expect(
        (['notify-family', 'request-ambulance', 'call-user', 'resolve'] as const).every(
          (k) => !closed[k].enabled,
        ),
      ).toBe(true);
    }
  });
});

describe('sosNextStep', () => {
  it('counts down to the ring deadline during a call', () => {
    const step = sosNextStep(
      sosDetail({
        state: 'CALLING_USER_1',
        calls: [
          {
            attemptNo: 1,
            status: 'RINGING',
            dtmf: null,
            provider: 'MSG91',
            failureReason: null,
            durationS: null,
            initiatedByAdminId: null,
            requestedAt: '2026-11-05T10:00:01Z',
            ringDeadlineAt: '2026-11-05T10:00:41Z',
            endedAt: null,
          },
        ],
      }),
    );
    expect(step?.atMs).toBe(Date.parse('2026-11-05T10:00:41Z'));
  });

  it('estimates call 2 at call-1 end + 30 s, capped by the 4 min watchdog', () => {
    const call = {
      attemptNo: 1,
      status: 'NO_ANSWER',
      dtmf: null,
      provider: 'MSG91',
      failureReason: null,
      durationS: 0,
      initiatedByAdminId: null,
      requestedAt: '2026-11-05T10:00:01Z',
      ringDeadlineAt: '2026-11-05T10:00:41Z',
      endedAt: '2026-11-05T10:00:40Z',
    };
    expect(sosNextStep(sosDetail({ state: 'WAITING_RETRY', calls: [call] }))?.atMs).toBe(
      Date.parse('2026-11-05T10:01:10Z'),
    );
    expect(
      sosNextStep(
        sosDetail({
          state: 'WAITING_RETRY',
          calls: [{ ...call, endedAt: '2026-11-05T10:09:00Z' }],
        }),
      )?.atMs,
    ).toBe(Date.parse('2026-11-05T10:04:00Z'));
  });

  it('is null once nothing automatic is pending', () => {
    expect(sosNextStep(sosDetail({ state: 'USER_SAFE_AWAITING_ADMIN' }))).toBeNull();
  });
});

describe('formatting helpers', () => {
  const t0 = Date.parse('2026-11-05T10:00:00Z');
  it('elapsed + countdown', () => {
    expect(formatSosElapsed('2026-11-05T10:00:00Z', t0 + 45_000)).toBe('45s');
    expect(formatSosElapsed('2026-11-05T10:00:00Z', t0 + 185_000)).toBe('3m 05s');
    expect(formatSosElapsed('2026-11-05T10:00:00Z', t0 + 2 * 3_600_000)).toBe('2h 0m');
    expect(formatSosElapsed('bad', t0)).toBe('—');
    expect(formatSosCountdown(t0 + 42_000, t0)).toBe('0:42');
    expect(formatSosCountdown(t0, t0 + 1)).toBeNull();
  });

  it('labels', () => {
    expect(sosStatusLabel({ state: 'RESOLVED', resolution: 'FALSE_ALARM' })).toBe('False alarm');
    expect(sosStatusLabel({ state: 'WAITING_RETRY', resolution: null })).toBe('Waiting to retry');
    expect(sosCallOutcome({ status: 'ANSWERED', dtmf: '1' })).toMatch(/safe/);
    expect(sosCallOutcome({ status: 'NO_ANSWER', dtmf: null })).toBe('No answer');
  });

  it('phone links', () => {
    expect(telHref('+91 98 7654 3210')).toBe('tel:+919876543210');
    expect(telHref('12')).toBeNull();
    expect(telHref(null)).toBeNull();
    expect(whatsAppHref('+91 98765 43210')).toBe('https://wa.me/919876543210');
  });

  it('note validation', () => {
    expect(sosNoteError('   ')).not.toBeNull();
    expect(sosNoteError('ok')).toBeNull();
    expect(sosNoteError('x'.repeat(2001))).not.toBeNull();
  });
});

describe('location trail', () => {
  it('falls back to alert locations when no live fix arrived', () => {
    const trail = sosTrail(
      sosDetail({
        alerts: [
          {
            alertId: 'a',
            status: 'RECEIVED',
            dispatchPath: 'FULL',
            reporterAccountId: null,
            createdAt: '2026-11-05T10:00:00Z',
            location: { lat: 19.07, lng: 72.87, accuracyM: 20 },
          },
        ],
      }),
    );
    expect(trail).toEqual([
      { lat: 19.07, lng: 72.87, accuracyM: 20, recordedAt: '2026-11-05T10:00:00Z' },
    ]);
  });

  it('projects inside the padded box and keeps north up', () => {
    const points = projectSosTrail(
      [
        { lat: 19.0, lng: 72.8 },
        { lat: 19.01, lng: 72.81 },
      ],
      { width: 100, height: 100, padding: 10 },
    );
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(10);
      expect(p.x).toBeLessThanOrEqual(90);
      expect(p.y).toBeGreaterThanOrEqual(10);
      expect(p.y).toBeLessThanOrEqual(90);
    }
    expect(points[1]?.y ?? 0).toBeLessThan(points[0]?.y ?? 0);
  });

  it('builds a directions link through the trail', () => {
    expect(googleMapsTrailHref([{ lat: 1, lng: 2 }])).toBeNull();
    const href = googleMapsTrailHref([
      { lat: 19, lng: 72 },
      { lat: 19.1, lng: 72.1 },
      { lat: 19.2, lng: 72.2 },
    ]);
    expect(href).toContain('origin=19.000000%2C72.000000');
    expect(href).toContain('destination=19.200000%2C72.200000');
    expect(href).toContain('waypoints=19.100000%2C72.100000');
  });
});
