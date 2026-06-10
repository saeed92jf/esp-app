/**
 * Normalize Persian/Arabic digits to English digits.
 */
function normalizeDigits(value: string): string {
  return value
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * Fast Aparat date parsing.
 * Used only once when mapping API data.
 */
export function parseAparatDateToTimestamp(dateStr: string): number {
  if (!dateStr) return Date.now();

  const clean = normalizeDigits(dateStr).split(" ")[0].split("T")[0];

  const parts = clean.split(/[/-]/);

  if (parts.length < 3) return Date.now();

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const gYear = year < 1700 ? year + 621 : year;

  return new Date(gYear, month - 1, day).getTime();
}
