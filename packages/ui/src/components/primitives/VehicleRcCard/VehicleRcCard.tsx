import { cn } from '../../../utils/cn';
import { AlChip } from '../Chip/Chip';
import { AlField } from '../Field/Field';

import type { AlVehicleRcCardProps } from './VehicleRcCard.types';
import './VehicleRcCard.css';

function chunkFields<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

export function AlVehicleRcCard({
  registrationNumber,
  verifiedLabel = 'Verified',
  verifiedIcon,
  watermarkIcon,
  fields,
  className,
}: AlVehicleRcCardProps) {
  const rows = chunkFields(fields, 2);

  return (
    <section
      className={cn('al-vehicle-rc-card', className)}
      aria-label="Vehicle registration details"
    >
      {watermarkIcon ? (
        <div className="al-vehicle-rc-card__watermark" aria-hidden>
          {watermarkIcon}
        </div>
      ) : null}
      <header className="al-vehicle-rc-card__header">
        <div className="al-vehicle-rc-card__title-group">
          <span className="al-vehicle-rc-card__badge">RC</span>
          <span className="al-vehicle-rc-card__title">Registration Certificate</span>
        </div>
        {verifiedIcon ? (
          <AlChip
            className="al-vehicle-rc-card__status"
            variant="green"
            label={verifiedLabel}
            icon={verifiedIcon}
          />
        ) : null}
      </header>
      <p className="al-vehicle-rc-card__registration">{registrationNumber}</p>
      <hr className="al-vehicle-rc-card__divider" />
      <div className="al-vehicle-rc-card__grid">
        {rows.map((row) => (
          <div key={row.map((field) => field.label).join('-')} className="al-vehicle-rc-card__row">
            {row.map((field) => (
              <AlField
                key={field.label}
                className="al-vehicle-rc-card__field"
                label={field.label}
                value={field.value}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
