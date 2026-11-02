/**
 * Palette ranking: what the operator types is almost always (the start of) a page name, so label
 * matches beat description matches, and loose fuzzy matching only applies to the label.
 * cmdk calls this with the item's `value` (= label) and `keywords` (= section + description).
 */
export function scoreAdminCommand(value: string, search: string, keywords: string[] = []): number {
  const query = search.trim().toLowerCase();
  if (!query) return 1;
  const label = value.replace(/^recent:/, '').toLowerCase();
  if (label === query) return 1;
  if (label.startsWith(query)) return 0.95;
  if (label.split(/[\s&/-]+/).some((word) => word.startsWith(query))) return 0.9;
  if (label.includes(query)) return 0.8;
  const extra = keywords.join(' ').toLowerCase();
  if (extra.split(/[\s&/,.()-]+/).some((word) => word.startsWith(query))) return 0.6;
  if (extra.includes(query)) return 0.5;
  // Loose: every typed character appears in order in the label ("tbk" → "Taxi bookings").
  let index = 0;
  for (const char of label) {
    if (char === query[index]) index += 1;
    if (index === query.length) return 0.3;
  }
  return 0;
}
