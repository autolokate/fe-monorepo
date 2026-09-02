/** Display-normalized plate — uppercase with collapsed whitespace. */
export function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/\s+/g, ' ').trim();
}

/** Compact plate for API query — uppercase alphanumeric only. */
export function compactPlate(value: string): string {
  return value.toUpperCase().replace(/\s+/g, '').trim();
}

export function isPlateEntryReady(plate: string): boolean {
  return compactPlate(plate).length >= 8;
}
