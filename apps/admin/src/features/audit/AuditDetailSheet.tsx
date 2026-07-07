import type { AuditEventDto } from '@autolokate/api-client';
import { AlSheet, AlStack, AlStatusBadge } from '@autolokate/ui';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
  formatMetadataEntries,
} from '@/platform/components/AdminDetailField.js';
import { formatAuditField } from '@/platform/utils/audit-field.js';

export type AuditDetailSheetProps = {
  event: AuditEventDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envelopeMeta?: { requestId: string | null; correlationId: string | null } | null;
};

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
  const metadataEntries = formatMetadataEntries(event.metadata);

  return (
    <AlSheet
      open={open}
      onOpenChange={onOpenChange}
      title={event.action.replaceAll('_', ' ')}
      description={formatDateTime(event.at)}
    >
      <AlStack gap="md">
        <AdminDetailSection title="Summary">
          <AlStatusBadge label={event.action} status="pending" />
          <AdminDetailGrid>
            <AdminDetailField label="Timestamp" value={formatDateTime(event.at)} />
            <AdminDetailField label="Event ID" value={event.id} mono />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Actor">
          <AdminDetailGrid>
            <AdminDetailField label="Admin user" value={formatAuditField(event.actorAdminId)} mono />
            <AdminDetailField label="Account" value={formatAuditField(event.actorAccountId)} mono />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Target">
          <AdminDetailGrid>
            <AdminDetailField label="Entity type" value={formatAuditField(event.targetType)} />
            <AdminDetailField label="Target ID" value={formatAuditField(event.targetId)} mono />
          </AdminDetailGrid>
        </AdminDetailSection>

        {metadataEntries.length > 0 ? (
          <AdminDetailSection title="Additional details">
            <AdminDetailGrid>
              {metadataEntries.map((entry) => (
                <AdminDetailField key={entry.label} label={entry.label} value={entry.value} mono />
              ))}
            </AdminDetailGrid>
          </AdminDetailSection>
        ) : null}

        <AdminDetailSection title="Trace IDs">
          <AdminDetailGrid>
            <AdminDetailField
              label="Request ID"
              value={metadataIds.requestId ?? envelopeMeta?.requestId ?? '—'}
              mono
            />
            <AdminDetailField
              label="Correlation ID"
              value={metadataIds.correlationId ?? envelopeMeta?.correlationId ?? '—'}
              mono
            />
          </AdminDetailGrid>
        </AdminDetailSection>
      </AlStack>
    </AlSheet>
  );
}
