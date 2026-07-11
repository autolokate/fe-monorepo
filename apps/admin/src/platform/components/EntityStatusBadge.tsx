import type { QrBatchStatus, QrCodeStatus } from '@autolokate/api-client';

import '../../styles/entity-status-badges.css';

type EntityStatusBadgeProps = {
  label: string;
  modifier: string;
};

function EntityStatusBadge({ label, modifier }: EntityStatusBadgeProps) {
  return (
    <span className={`admin-entity-status-badge ${modifier}`}>
      <span className="admin-entity-status-badge__dot" aria-hidden />
      {label}
    </span>
  );
}

export function QrCodeStatusBadge({ status }: { status: QrCodeStatus }) {
  return (
    <EntityStatusBadge label={status} modifier={`admin-entity-status-badge--qr-${status}`} />
  );
}

export function BatchStatusBadge({ status }: { status: QrBatchStatus }) {
  return (
    <EntityStatusBadge label={status} modifier={`admin-entity-status-badge--batch-${status}`} />
  );
}
