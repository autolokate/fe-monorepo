import type { QrPublicVehicle } from '@autolokate/api-client';
import type { AlVehicleRcField } from '@autolokate/ui';

/** Map public resolve vehicle DTO into RC card fields for purchase screens. */
export function mapQrPublicVehicleToFields(vehicle: QrPublicVehicle): AlVehicleRcField[] {
  const fields: AlVehicleRcField[] = [];
  const push = (label: string, value: string | null | undefined) => {
    if (value?.trim()) {
      fields.push({ label, value: value.trim() });
    }
  };

  push('Make', vehicle.make);
  push('Model', vehicle.model);
  push('Colour', vehicle.color);
  push('Protection', vehicle.protection);

  return fields;
}
