import {
  getEmergencyAlertStatus,
  getParkStatus,
  type AlertStatus,
  type ParkStatus,
} from '@autolokate/api-client';

import { getQrBootstrapClient } from '@/platform/api/qr-api-client.js';
import { anonymousScannerRepository } from '@/platform/storage/repositories/anonymous-scanner-repository.js';
import { parkSessionRepository } from '@/platform/storage/repositories/park-session-repository.js';

import { scannerLogger } from './scanner-logger.js';
import {
  delay,
  EMERGENCY_POLL_INITIAL_MS,
  EMERGENCY_POLL_MAX_MS,
  EMERGENCY_POLL_TIMEOUT_MS,
  PARK_POLL_INITIAL_MS,
  PARK_POLL_MAX_MS,
  PARK_POLL_TIMEOUT_MS,
  withTimeout,
  SCANNER_REQUEST_TIMEOUT_MS,
} from './scanner-network.js';

type PollListener<T> = (status: T) => void;

type PollSession<T> = {
  resourceId: string;
  stopped: boolean;
  listeners: Set<PollListener<T>>;
};

const TERMINAL_PARK_STATUSES = new Set<ParkStatus>(['RESOLVED', 'PHOTO_INVALID', 'EXPIRED']);
const TERMINAL_ALERT_STATUSES = new Set<AlertStatus>(['RESOLVED', 'CANCELLED']);

let parkPollSession: PollSession<ParkStatus> | null = null;
let emergencyPollSession: PollSession<AlertStatus> | null = null;

function notifyListeners<T>(session: PollSession<T>, status: T): void {
  session.listeners.forEach((listener) => {
    listener(status);
  });
}

async function runParkPollLoop(session: PollSession<ParkStatus>): Promise<void> {
  const client = getQrBootstrapClient();
  const startedAt = Date.now();
  let intervalMs = PARK_POLL_INITIAL_MS;

  while (!session.stopped) {
    if (Date.now() - startedAt > PARK_POLL_TIMEOUT_MS) {
      scannerLogger.warn('park_poll_timeout', { notificationId: session.resourceId });
      session.stopped = true;
      if (parkPollSession === session) {
        parkPollSession = null;
      }
      return;
    }

    try {
      const statusDto = await withTimeout(
        getParkStatus(client, session.resourceId),
        SCANNER_REQUEST_TIMEOUT_MS,
      );

      notifyListeners(session, statusDto.status);

      if (TERMINAL_PARK_STATUSES.has(statusDto.status)) {
        scannerLogger.info('park_poll_terminal', { status: statusDto.status });
        session.stopped = true;
        if (parkPollSession === session) {
          parkPollSession = null;
        }
        return;
      }
    } catch (error) {
      scannerLogger.warn('park_poll_tick_failed', { error });
    }

    await delay(intervalMs);
    intervalMs = Math.min(intervalMs * 2, PARK_POLL_MAX_MS);
  }
}

async function runEmergencyPollLoop(session: PollSession<AlertStatus>): Promise<void> {
  const client = getQrBootstrapClient();
  const startedAt = Date.now();
  let intervalMs = EMERGENCY_POLL_INITIAL_MS;

  while (!session.stopped) {
    if (Date.now() - startedAt > EMERGENCY_POLL_TIMEOUT_MS) {
      scannerLogger.warn('emergency_poll_timeout', { alertId: session.resourceId });
      session.stopped = true;
      if (emergencyPollSession === session) {
        emergencyPollSession = null;
      }
      return;
    }

    try {
      const statusDto = await withTimeout(
        getEmergencyAlertStatus(client, session.resourceId),
        SCANNER_REQUEST_TIMEOUT_MS,
      );

      notifyListeners(session, statusDto.status);

      if (TERMINAL_ALERT_STATUSES.has(statusDto.status)) {
        scannerLogger.info('emergency_poll_terminal', { status: statusDto.status });
        session.stopped = true;
        if (emergencyPollSession === session) {
          emergencyPollSession = null;
        }
        return;
      }
    } catch (error) {
      scannerLogger.warn('emergency_poll_tick_failed', { error });
    }

    await delay(intervalMs);
    intervalMs = Math.min(intervalMs * 2, EMERGENCY_POLL_MAX_MS);
  }
}

/**
 * Subscribe to park status polling. Unsubscribe does NOT cancel in-flight requests.
 * The poll loop survives route transitions between tracker screens.
 */
export function subscribeParkStatusPoll(
  listener: PollListener<ParkStatus>,
  notificationId?: string,
): () => void {
  const id = notificationId ?? parkSessionRepository.readNotificationId();
  if (!id) {
    scannerLogger.warn('park_poll_missing_notification_id');
    return () => {};
  }

  if (parkPollSession?.resourceId === id && !parkPollSession.stopped) {
    parkPollSession.listeners.add(listener);
    return () => {
      parkPollSession?.listeners.delete(listener);
    };
  }

  if (parkPollSession) {
    parkPollSession.stopped = true;
  }

  const session: PollSession<ParkStatus> = {
    resourceId: id,
    stopped: false,
    listeners: new Set([listener]),
  };
  parkPollSession = session;
  void runParkPollLoop(session);

  return () => {
    session.listeners.delete(listener);
  };
}

/**
 * Subscribe to emergency alert polling. Unsubscribe does NOT cancel in-flight requests.
 * The poll loop survives route transitions between tracker screens.
 */
export function subscribeEmergencyAlertPoll(
  listener: PollListener<AlertStatus>,
  alertId?: string,
): () => void {
  const id = alertId ?? anonymousScannerRepository.readAlertId();
  if (!id) {
    scannerLogger.warn('emergency_poll_missing_alert_id');
    return () => {};
  }

  if (emergencyPollSession?.resourceId === id && !emergencyPollSession.stopped) {
    emergencyPollSession.listeners.add(listener);
    return () => {
      emergencyPollSession?.listeners.delete(listener);
    };
  }

  if (emergencyPollSession) {
    emergencyPollSession.stopped = true;
  }

  const session: PollSession<AlertStatus> = {
    resourceId: id,
    stopped: false,
    listeners: new Set([listener]),
  };
  emergencyPollSession = session;
  void runEmergencyPollLoop(session);

  return () => {
    session.listeners.delete(listener);
  };
}

export function stopParkStatusPoll(): void {
  if (parkPollSession) {
    parkPollSession.stopped = true;
    parkPollSession = null;
  }
}

export function stopEmergencyAlertPoll(): void {
  if (emergencyPollSession) {
    emergencyPollSession.stopped = true;
    emergencyPollSession = null;
  }
}

export function stopAllScannerPolls(): void {
  stopParkStatusPoll();
  stopEmergencyAlertPoll();
}
