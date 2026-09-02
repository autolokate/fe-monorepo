/**
 * Money crosses the wire as integer paise. Every conversion here is integer arithmetic on the digit
 * string — never `rupees * 100` on a float, which silently loses a paisa (e.g. `9.99 * 100 === 998.9999…`).
 */

const RUPEE_INPUT_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

/** Parse a rupee input (`"999"`, `"999.5"`, `"999.50"`) into integer paise. `null` when unparseable. */
export function rupeesToPaise(input: string): number | null {
  const trimmed = input.trim();
  if (!RUPEE_INPUT_PATTERN.test(trimmed)) {
    return null;
  }
  const [whole, fraction] = trimmed.split('.');
  const paiseFraction = (fraction ?? '').padEnd(2, '0');
  return Number(whole) * 100 + Number(paiseFraction);
}

/** Paise → the plain rupee string a `<input>` should hold (`99900` → `"999"`, `99950` → `"999.50"`). */
export function paiseToRupeeInput(paise: number): string {
  const whole = Math.trunc(paise / 100);
  const remainder = Math.abs(paise % 100);
  if (remainder === 0) {
    return String(whole);
  }
  return `${String(whole)}.${String(remainder).padStart(2, '0')}`;
}

/**
 * Paise → display rupees, Indian grouping (`99900` → `"₹999"`, `99950` → `"₹999.50"`).
 * A part-rupee amount always shows both decimals — `₹999.5` is not how money is written.
 */
export function formatPaiseAsRupees(paise: number): string {
  const hasPaise = paise % 100 !== 0;
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
