import type { AdminTaxiFleetDriver } from '@autolokate/api-client';

import { taxiMediaStatusTone } from '@/features/taxi/taxi-fleet-format';
import { AdminStatusChip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './taxi-v4.css';

const SOURCE_LABELS: Record<AdminTaxiFleetDriver['source'], string> = {
  ASSIGNED: 'Assigned driver',
  OWNER: 'Org owner (drives)',
};

/** Driver name + camera photo shown to customers on bid cards (signed URL, short-lived). */
export function TaxiDriverIdentity({
  driver,
  compact = false,
}: {
  driver: AdminTaxiFleetDriver | null | undefined;
  compact?: boolean;
}) {
  if (!driver) {
    return <span className="taxi-note">No driver set (bids blocked: driver missing).</span>;
  }
  const name = driver.displayName ?? 'Name not set';
  const photo = driver.photo;
  return (
    <div className="taxi-driver-card" data-testid="taxi-driver-identity">
      <div className={`taxi-driver-photo${compact ? ' taxi-driver-photo--sm' : ''}`}>
        {photo.url ? (
          <img className="taxi-driver-photo" src={photo.url} alt={`Driver ${name}`} />
        ) : (
          <span>{compact ? '—' : 'No photo'}</span>
        )}
      </div>
      <div className="taxi-fleet-cell">
        <span className="taxi-fleet-cell__primary">{name}</span>
        <span className="taxi-fleet-cell__secondary">{SOURCE_LABELS[driver.source]}</span>
        {!compact ? (
          <span className="taxi-fleet-cell__secondary">
            <AdminStatusChip
              label={`Photo ${humanizeAdminLabel(photo.status).toLowerCase()}`}
              tone={taxiMediaStatusTone(photo.status)}
            />{' '}
            {photo.capturedAt ? `captured ${formatAdminDateTime(photo.capturedAt)}` : null}
            {photo.expiresAt ? ` · expires ${formatAdminDateTime(photo.expiresAt)}` : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
