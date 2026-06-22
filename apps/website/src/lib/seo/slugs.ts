/**
 * Lowercase URL segment helper: letters, digits, hyphens only.
 *
 * Used to derive a stable slug from any display name (e.g. brand names that
 * the API hasn't normalised into kebab-case yet).
 */
export function slugifyPart(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
