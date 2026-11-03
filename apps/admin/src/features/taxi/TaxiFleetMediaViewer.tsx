import type { AdminTaxiFleetMediaItemDto, AdminTaxiMediaSlotState } from '@autolokate/api-client';
import { AlButton } from '@autolokate/ui';

import { taxiMediaSlotLabel, taxiMediaStatusTone } from '@/features/taxi/taxi-fleet-format';
import { AdminStatusChip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

export type TaxiFleetMediaViewerProps = {
  items: AdminTaxiFleetMediaItemDto[];
  slots: AdminTaxiMediaSlotState[];
  canRemove: boolean;
  onRemove: (item: AdminTaxiFleetMediaItemDto) => void;
};

/**
 * What customers see on bid cards: one tile per live slot (signed URL, 300 s) plus a placeholder for
 * each slot with no live media. Nothing is cached — reopen the vehicle to refresh expired URLs.
 */
export function TaxiFleetMediaViewer({
  items,
  slots,
  canRemove,
  onRemove,
}: TaxiFleetMediaViewerProps) {
  const bySlot = new Map(items.map((item) => [item.slot, item]));
  const emptySlots = slots.filter((slot) => !bySlot.has(slot.slot));

  return (
    <div className="taxi-media-grid" data-testid="taxi-fleet-media">
      {items.map((item) => {
        const state = slots.find((slot) => slot.slot === item.slot);
        return (
          <figure
            key={item.mediaId}
            className="taxi-media-tile"
            data-testid={`taxi-fleet-media-${item.slot}`}
          >
            <div className="taxi-media-tile__head">
              <span>{taxiMediaSlotLabel(item.slot)}</span>
              {state ? (
                <AdminStatusChip
                  label={humanizeAdminLabel(state.status)}
                  tone={taxiMediaStatusTone(state.status)}
                />
              ) : null}
            </div>
            <div className="taxi-media-tile__frame">
              {!item.url ? (
                <span className="taxi-media-tile__gone">Bytes gone — the file was purged.</span>
              ) : item.kind === 'VIDEO' ? (
                <video
                  src={item.url}
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={`${taxiMediaSlotLabel(item.slot)} video`}
                >
                  <track kind="captions" />
                </video>
              ) : (
                <a href={item.url} target="_blank" rel="noreferrer noopener">
                  <img
                    src={item.url}
                    alt={`${taxiMediaSlotLabel(item.slot)} view`}
                    loading="lazy"
                  />
                </a>
              )}
            </div>
            <figcaption className="taxi-media-tile__meta">
              Captured {formatAdminDateTime(item.capturedAt)}
              <br />
              Expires {formatAdminDateTime(item.expiresAt)}
              {typeof item.durationSeconds === 'number'
                ? ` · ${String(item.durationSeconds)} s`
                : ''}
            </figcaption>
            {canRemove ? (
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`taxi-fleet-media-remove-${item.slot}`}
                onClick={() => {
                  onRemove(item);
                }}
              >
                Remove
              </AlButton>
            ) : null}
          </figure>
        );
      })}
      {emptySlots.map((slot) => (
        <div
          key={slot.slot}
          className="taxi-media-tile"
          data-testid={`taxi-fleet-slot-${slot.slot}`}
        >
          <div className="taxi-media-tile__head">
            <span>{taxiMediaSlotLabel(slot.slot)}</span>
            <AdminStatusChip
              label={humanizeAdminLabel(slot.status)}
              tone={taxiMediaStatusTone(slot.status)}
            />
          </div>
          <div className="taxi-media-tile__frame">
            <span className="taxi-media-tile__gone">No live media for this slot.</span>
          </div>
        </div>
      ))}
    </div>
  );
}
