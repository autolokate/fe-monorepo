import type { AdminSosDetail, AdminSosSummary } from '@autolokate/api-client';

/** Test-only builders (synthetic data — no real names or numbers). */
export function sosRow(overrides: Partial<AdminSosSummary> = {}): AdminSosSummary {
  return {
    incidentId: 'inc-1',
    alertId: 'alert-1',
    trigger: 'SOS',
    state: 'CALLING_USER_1',
    urgent: false,
    subject: { accountId: 'acc-1', name: 'Test User', phone: '+910000000001' },
    vehicleId: null,
    userResponse: null,
    userResponseChannel: null,
    activationReason: null,
    ambulanceReleasedAt: null,
    familyNotifiedRounds: 0,
    lastCall: null,
    openedAt: '2026-11-05T10:00:00.000Z',
    updatedAt: '2026-11-05T10:00:00.000Z',
    resolution: null,
    ...overrides,
  };
}

export function sosDetail(overrides: Partial<AdminSosDetail> = {}): AdminSosDetail {
  return {
    ...sosRow(),
    incident: {
      source: 'APP',
      openedAt: '2026-11-05T10:00:00.000Z',
      resolvedAt: null,
      suspectedFalseAlarm: false,
    },
    alerts: [],
    locations: [],
    vehicles: [],
    contacts: [],
    crash: [],
    calls: [],
    timeline: [],
    dispatchSteps: [],
    ...overrides,
  };
}
