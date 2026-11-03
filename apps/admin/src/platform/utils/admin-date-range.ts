/**
 * `<input type="date">` values (YYYY-MM-DD, the operator's local day) → ISO bounds for a
 * `from` (inclusive) / `to` (exclusive) server filter. `to` becomes the NEXT local midnight so the
 * chosen end day is included. Invalid / empty input → undefined (no bound sent).
 */
const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;

function localMidnight(value: string): Date | null {
  if (!DATE_INPUT.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateInputToFromIso(value: string): string | undefined {
  return localMidnight(value)?.toISOString();
}

export function dateInputToExclusiveToIso(value: string): string | undefined {
  const date = localMidnight(value);
  if (!date) return undefined;
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

/** True when both are set and the end day is before the start day. */
export function isDateRangeInverted(from: string, to: string): boolean {
  const a = localMidnight(from);
  const b = localMidnight(to);
  return a !== null && b !== null && b.getTime() < a.getTime();
}
