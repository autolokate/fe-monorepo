import type { RcRecordDto } from '@autolokate/api-client';
import type { AlVehicleRcField } from '@autolokate/ui';
import { formatVehicleRegistration } from '@autolokate/utils';

import type { VehicleSession } from '@/journey/types';

import { normalizePlate } from './vehicle-plate';

function formatRcDate(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(parsed));
}

function pushField(
  fields: AlVehicleRcField[],
  label: string,
  value: string | number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }
  const text = String(value).trim();
  if (!text) {
    return;
  }
  fields.push({ label, value: text });
}

/** Map backend RC DTO into existing RC card field rows (no schema changes). */
export function mapRcRecordToFields(record: RcRecordDto): AlVehicleRcField[] {
  const fields: AlVehicleRcField[] = [];

  pushField(fields, 'Maker', record.make);
  pushField(fields, 'Model', record.model);
  pushField(fields, 'Fuel', record.fuel);
  pushField(fields, 'Year', record.year);
  pushField(fields, 'Insurance', record.insuranceStatus);
  pushField(fields, 'PUC', record.pucStatus);
  pushField(fields, 'Valid till', formatRcDate(record.rcValidTill));

  return fields;
}

export function mapRcRecordToVehicleSession(
  record: RcRecordDto,
): Pick<VehicleSession, 'plate' | 'fields'> {
  return {
    plate: normalizePlate(formatVehicleRegistration(record.registration)),
    fields: mapRcRecordToFields(record),
  };
}
