import type { QrPublicVehicle } from '@autolokate/api-client';
import type { AlVehicleRcField } from '@autolokate/ui';

/** Compact model line from anonymous QR resolve — e.g. "White · Maruti Swift". */
export function formatQrPublicVehicleSummary(vehicle: QrPublicVehicle): string {
  const colour = vehicle.color?.split(' ').pop() ?? vehicle.color ?? '';
  const maker = vehicle.make ?? '';
  const model = vehicle.model ?? '';
  if (!colour && !maker && !model) {
    return '';
  }
  const makeShort = maker.includes('Maruti') ? 'Maruti' : maker.split(' ')[0] ?? maker;
  const modelShort = model.split(' ')[0] ?? model;
  return `${colour} · ${makeShort} ${modelShort}`.trim();
}

export function isQrVehicleProtected(protection: QrPublicVehicle['protection']): boolean {
  return protection === 'PROTECTED' || protection === 'EXPIRING';
}

/** Compact model line for Figma confirm cards — e.g. "White · Maruti Swift". */
export function formatReporterModelSummary(fields: AlVehicleRcField[]): string {
  const colour = fields.find((field) => field.label === 'Colour')?.value ?? 'White';
  const maker = fields.find((field) => field.label === 'Maker')?.value ?? '';
  const model = fields.find((field) => field.label === 'Model')?.value ?? '';
  const colourShort = colour.split(' ').pop() ?? colour;
  const makeShort = maker.includes('Maruti') ? 'Maruti' : maker.split(' ')[0] ?? maker;
  const modelShort = model.split(' ')[0] ?? model;
  return `${colourShort} · ${makeShort} ${modelShort}`.trim();
}
