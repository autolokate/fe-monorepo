/** Indian plate layout — XX NN XX NNNN → "MH 12 AB 3456" */
export function formatPlateInput(value: string): string {
  const compact = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
  const state = compact.slice(0, 2);
  const district = compact.slice(2, 4);
  const series = compact.slice(4, 6);
  const number = compact.slice(6, 10);

  const segments = [state];
  if (district) {
    segments.push(district);
  }
  if (series) {
    segments.push(series);
  }
  if (number) {
    segments.push(number);
  }

  return segments.join(' ');
}
