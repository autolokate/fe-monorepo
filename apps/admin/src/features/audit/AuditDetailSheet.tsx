import type { AuditEventDto } from '@autolokate/api-client';
import { AlModal, AlStack } from '@autolokate/ui';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
  formatMetadataEntries,
} from '@/platform/components/AdminDetailField';
import { AuditActionBadge } from '@/platform/components/EntityStatusBadge';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { formatAuditField } from '@/platform/utils/audit-field';

export type AuditDetailSheetProps = {
  event: AuditEventDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function formatActor(event: AuditEventDto): string {
  if (event.actorAdminId) {
    return 'Admin user';
  }
  if (event.actorAccountId) {
    return 'Account';
  }
  return 'System';
}

export function AuditDetailSheet({ event, open, onOpenChange }: AuditDetailSheetProps) {
  if (!event) {
    return null;
  }

  const metadataEntries = formatMetadataEntries(event.metadata);

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={humanizeAdminLabel(event.action)}
      description={formatDateTime(event.at)}
    >
      <AlStack gap="md">
        <AdminDetailSection title="Summary" description="What happened and who did it.">
          <div className="admin-status-row">
            <AuditActionBadge action={event.action} />
          </div>
          <AdminDetailGrid>
            <AdminDetailField label="When" value={formatDateTime(event.at)} />
            <AdminDetailField label="Actor" value={formatActor(event)} />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Target" description="Entity this action applied to.">
          <AdminDetailGrid>
            <AdminDetailField label="Entity type" value={formatAuditField(event.targetType)} />
          </AdminDetailGrid>
        </AdminDetailSection>

        {metadataEntries.length > 0 ? (
          <AdminDetailSection title="Additional details">
            <AdminDetailGrid>
              {metadataEntries.map((entry) => (
                <AdminDetailField
                  key={entry.label}
                  label={humanizeAdminLabel(entry.label)}
                  value={entry.value}
                  mono
                />
              ))}
            </AdminDetailGrid>
          </AdminDetailSection>
        ) : null}
      </AlStack>
    </AlModal>
  );
}
