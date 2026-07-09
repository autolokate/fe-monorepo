import type { BystanderRcRecordDto } from '@autolokate/api-client';
import type { AlVehicleRcField } from '@autolokate/ui';
import { formatVehicleRegistration } from '@autolokate/utils';

import { normalizePlate } from '@/services/vehicle/vehicle-plate';
import { mapRcRecordToFields } from '@/services/vehicle/vehicle-mapper';

/** Map park vehicle lookup DTO into PWA reporter card fields. */
export function mapBystanderRcToLookupResult(record: BystanderRcRecordDto): {
  plate: string;
  fields: AlVehicleRcField[];
} {
  const plate = normalizePlate(formatVehicleRegistration(record.registration));
  const fields = mapRcRecordToFields(record);
  return { plate, fields };
}
