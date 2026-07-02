import type { QrStatus } from '@autolokate/api-client';

/** Shared QR lifecycle statuses — mirrors backend `QrStatus` enum values. */
export const QR_STATUS = {
  MANUFACTURED: 'MANUFACTURED',
  PROVISIONED: 'PROVISIONED',
  DISTRIBUTED: 'DISTRIBUTED',
  ATTACHED: 'ATTACHED',
  ATTACHED_UNPAID: 'ATTACHED_UNPAID',
  ACTIVATED: 'ACTIVATED',
  LAPSED: 'LAPSED',
  TRANSFERRED: 'TRANSFERRED',
  CANCELLED: 'CANCELLED',
  REPLACED_LOST: 'REPLACED_LOST',
  RETIRED: 'RETIRED',
} as const satisfies Record<string, QrStatus>;

export type QrLifecycleStatus = (typeof QR_STATUS)[keyof typeof QR_STATUS];

const EXPIRED_QR_STATUSES = new Set<QrStatus>([
  QR_STATUS.LAPSED,
  QR_STATUS.CANCELLED,
  QR_STATUS.RETIRED,
  QR_STATUS.TRANSFERRED,
  QR_STATUS.REPLACED_LOST,
]);

const PRE_ATTACH_PURCHASE_STATUSES = new Set<QrStatus>([
  QR_STATUS.MANUFACTURED,
  QR_STATUS.PROVISIONED,
  QR_STATUS.DISTRIBUTED,
]);

const ATTACHED_PURCHASE_STATUSES = new Set<QrStatus>([
  QR_STATUS.ATTACHED,
  QR_STATUS.ATTACHED_UNPAID,
]);

export function isExpiredQrLifecycleStatus(status: QrStatus): boolean {
  return EXPIRED_QR_STATUSES.has(status);
}

/** QR has never been activated — start full purchase / activation journey. */
export function isDistributedQrLifecycleStatus(status: QrStatus): boolean {
  return PRE_ATTACH_PURCHASE_STATUSES.has(status);
}

/** QR is already linked to a vehicle — skip vehicle + attach in purchase. */
export function isAttachedQrLifecycleStatus(status: QrStatus): boolean {
  return ATTACHED_PURCHASE_STATUSES.has(status);
}

/** QR is fully activated — route to post-scan (bystander) journey. */
export function isActivatedQrLifecycleStatus(status: QrStatus): boolean {
  return status === QR_STATUS.ACTIVATED;
}
