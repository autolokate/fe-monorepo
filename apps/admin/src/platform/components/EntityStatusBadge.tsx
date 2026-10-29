import type {
  AdminIncidentStatus,
  AdminQaStatus,
  AdminReelStatus,
  AdminOrderStatus,
  AdminPaymentOutcome,
  AdminShipmentStatus,
  AdminSubscriptionStatus,
  AdminSupportTicketStatus,
  AuditAction,
  QrBatchStatus,
  QrCodeStatus,
} from '@autolokate/api-client';

import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

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
  return <EntityStatusBadge label={status} modifier={`admin-entity-status-badge--qr-${status}`} />;
}

export function BatchStatusBadge({ status }: { status: QrBatchStatus }) {
  return (
    <EntityStatusBadge label={status} modifier={`admin-entity-status-badge--batch-${status}`} />
  );
}

export function OrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  return (
    <EntityStatusBadge
      label={humanizeAdminLabel(status)}
      modifier={`admin-entity-status-badge--order-${status}`}
    />
  );
}

export function SubscriptionStatusBadge({ status }: { status: AdminSubscriptionStatus }) {
  return (
    <EntityStatusBadge
      label={humanizeAdminLabel(status)}
      modifier={`admin-entity-status-badge--subscription-${status}`}
    />
  );
}

export function ShipmentStatusBadge({ status }: { status: AdminShipmentStatus }) {
  return (
    <EntityStatusBadge
      label={humanizeAdminLabel(status)}
      modifier={`admin-entity-status-badge--shipment-${status}`}
    />
  );
}

export function PaymentOutcomeBadge({ outcome }: { outcome: AdminPaymentOutcome }) {
  return (
    <EntityStatusBadge
      label={humanizeAdminLabel(outcome)}
      modifier={`admin-entity-status-badge--payment-${outcome}`}
    />
  );
}

export function SupportTicketStatusBadge({ status }: { status: AdminSupportTicketStatus }) {
  return (
    <EntityStatusBadge
      label={humanizeAdminLabel(status)}
      modifier={`admin-entity-status-badge--support-${status}`}
    />
  );
}

export function IncidentStatusBadge({ status }: { status: AdminIncidentStatus }) {
  return (
    <EntityStatusBadge label={status} modifier={`admin-entity-status-badge--incident-${status}`} />
  );
}

export function AuditActionBadge({ action }: { action: AuditAction }) {
  return (
    <EntityStatusBadge
      label={action}
      modifier={`admin-entity-status-badge--audit admin-entity-status-badge--audit-${action}`}
    />
  );
}

export function DiscoveryQaStatusBadge({ status }: { status: AdminQaStatus }) {
  return (
    <EntityStatusBadge
      label={status === 'VISIBLE' ? 'Published' : 'Hidden'}
      modifier={`admin-entity-status-badge--discovery-qa-${status}`}
    />
  );
}

export function DiscoveryReelStatusBadge({ status }: { status: AdminReelStatus }) {
  return (
    <EntityStatusBadge
      label={status === 'PUBLISHED' ? 'Published' : status === 'DRAFT' ? 'Draft' : 'Archived'}
      modifier={`admin-entity-status-badge--discovery-reel-${status}`}
    />
  );
}
