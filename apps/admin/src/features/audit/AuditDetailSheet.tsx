import type { AuditEventDto } from '@autolokate/api-client';
import {
  AlSectionHeader,
  AlSheet,
  AlStack,
  AlStatusBadge,
  AlText,
} from '@autolokate/ui';

import { formatAuditField } from '@/platform/utils/audit-field.js';

import './audit-events.css';

export type AuditDetailSheetProps = {
  event: AuditEventDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envelopeMeta?: { requestId: string | null; correlationId: string | null } | null;
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <AlStack gap="xs">
      <AlText variant="caption" tone="muted">
        {label}
      </AlText>
      <AlText>{value}</AlText>
    </AlStack>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function metadataCorrelationIds(metadata: object | null): {
  requestId: string | null;
  correlationId: string | null;
} {
  if (!metadata || typeof metadata !== 'object') {
    return { requestId: null, correlationId: null };
  }
  const record = metadata as Record<string, unknown>;
  const requestId = typeof record.requestId === 'string' ? record.requestId : null;
  const correlationId = typeof record.correlationId === 'string' ? record.correlationId : null;
  return { requestId, correlationId };
}

export function AuditDetailSheet({ event, open, onOpenChange, envelopeMeta }: AuditDetailSheetProps) {
  if (!event) {
    return null;
  }

  const metadataIds = metadataCorrelationIds(event.metadata);

  return (
    <AlSheet
      open={open}
      onOpenChange={onOpenChange}
      title={event.action}
      description="AuditEventDto from GET /admin/v1/audit-events"
    >
      <AlStack gap="lg">
        <section>
          <AlSectionHeader title="Overview" />
          <AlStack gap="md">
            <DetailField label="Action" value={event.action} />
            <DetailField label="Timestamp" value={formatDateTime(event.at)} />
            <DetailField label="Event ID" value={event.id} />
            <AlStack gap="xs">
              <AlText variant="caption" tone="muted">
                Action type
              </AlText>
              <AlStatusBadge label={event.action} status="pending" />
            </AlStack>
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Timeline" description="Derived from AuditEventDto.at only." />
          <div className="audit-timeline">
            <div className="audit-timeline__item">
              <AlStack gap="xs">
                <AlText variant="label">{event.action}</AlText>
                <AlText variant="caption" tone="muted">
                  {formatDateTime(event.at)}
                </AlText>
              </AlStack>
            </div>
          </div>
        </section>

        <section>
          <AlSectionHeader title="Actor" />
          <AlStack gap="md">
            <DetailField label="Actor admin ID" value={formatAuditField(event.actorAdminId)} />
            <DetailField label="Actor account ID" value={formatAuditField(event.actorAccountId)} />
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Entity" />
          <AlStack gap="md">
            <DetailField label="Target type" value={formatAuditField(event.targetType)} />
            <DetailField label="Target ID" value={formatAuditField(event.targetId)} />
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Metadata" />
          <pre className="audit-detail-sheet__raw">
            {event.metadata ? JSON.stringify(event.metadata, null, 2) : 'null'}
          </pre>
        </section>

        <section>
          <AlSectionHeader title="Correlation" description="From event metadata when present; list envelope meta shown below." />
          <AlStack gap="md">
            <DetailField
              label="Metadata request ID"
              value={metadataIds.requestId ?? '—'}
            />
            <DetailField
              label="Metadata correlation ID"
              value={metadataIds.correlationId ?? '—'}
            />
            <DetailField
              label="List request ID"
              value={envelopeMeta?.requestId ?? '—'}
            />
            <DetailField
              label="List correlation ID"
              value={envelopeMeta?.correlationId ?? '—'}
            />
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Raw API" description="AuditEventDto payload" />
          <pre className="audit-detail-sheet__raw">{JSON.stringify(event, null, 2)}</pre>
        </section>

        <section>
          <AlSectionHeader title="Developer information" />
          <AlStack gap="md">
            <DetailField label="DTO" value="AuditEventDto" />
            <DetailField label="Endpoint" value="GET /admin/v1/audit-events" />
            <DetailField label="Read-only" value="Yes — no mutation endpoints in OpenAPI" />
          </AlStack>
        </section>
      </AlStack>
    </AlSheet>
  );
}
