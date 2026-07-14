import type { QrPublicVehicle } from '@autolokate/api-client';
import type { AlVehicleRcField } from '@autolokate/ui';

function shortenMake(maker: string): string {
  const trimmed = maker.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.includes('Maruti') ? 'Maruti' : trimmed.split(' ')[0] ?? trimmed;
}

function shortenModel(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.split(' ')[0] ?? trimmed;
}

function shortenColour(colour: string): string {
  const trimmed = colour.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.split(' ').pop() ?? trimmed;
}

/** Join colour + make/model — omit the middle dot when colour is missing. */
function formatColourMakeModelLine(colour: string, maker: string, model: string): string {
  const colourShort = shortenColour(colour);
  const makeModel = [shortenMake(maker), shortenModel(model)].filter(Boolean).join(' ').trim();

  if (colourShort && makeModel) {
    return `${colourShort} · ${makeModel}`;
  }
  return colourShort || makeModel;
}

/** Compact model line from anonymous QR resolve — e.g. "White · Maruti Swift". */
export function formatQrPublicVehicleSummary(vehicle: QrPublicVehicle): string {
  return formatColourMakeModelLine(vehicle.color ?? '', vehicle.make ?? '', vehicle.model ?? '');
}

export function isQrVehicleProtected(protection: QrPublicVehicle['protection']): boolean {
  return protection === 'PROTECTED' || protection === 'EXPIRING';
}

/** Compact model line for Figma confirm cards — e.g. "White · Maruti Swift". */
export function formatReporterModelSummary(fields: AlVehicleRcField[]): string {
  const colour = fields.find((field) => field.label === 'Colour')?.value ?? '';
  const maker = fields.find((field) => field.label === 'Maker')?.value ?? '';
  const model = fields.find((field) => field.label === 'Model')?.value ?? '';
  return formatColourMakeModelLine(colour, maker, model);
}
