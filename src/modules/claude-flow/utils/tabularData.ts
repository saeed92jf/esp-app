// src/modules/claude-flow/utils/tabularData.ts
// Parses text copied from Excel/Sheets (tab-separated) or a plain .csv file
// (comma-separated) into a simple string[][] grid. No external library
// needed for this — Excel's own clipboard format for a cell range is just
// TSV, and this project doesn't have a binary .xlsx parser installed, so
// "Excel input" here means "paste from Excel" or "upload a .csv/.tsv file",
// not reading an actual .xlsx binary.

/** Guesses the delimiter by counting which one shows up more in the first line. */
function detectDelimiter(firstLine: string): "\t" | "," {
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs >= commas ? "\t" : ",";
}

/** A minimal CSV-cell splitter that understands quoted fields (so a comma
 *  inside "quotes, like this" doesn't split into two cells). Tab-separated
 *  data from Excel never needs this (Excel doesn't quote tab-delimited
 *  cells), so it's only used for the comma-delimiter path. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

export function parseDelimitedText(text: string): string[][] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  // Drop a single trailing empty line (common when copying a full range).
  while (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  if (lines.length === 0) return [[""]];

  const delimiter = detectDelimiter(lines[0]);
  const rows = lines.map((line) => (delimiter === "\t" ? line.split("\t") : splitCsvLine(line)));

  // Pad every row to the same width as the longest one, so the grid is
  // always rectangular (React and our own cell-index math both assume that).
  const width = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => (r.length < width ? [...r, ...Array(width - r.length).fill("")] : r));
}

/** Pastes `incoming` into `base` starting at (startRow, startCol), growing
 *  `base` (rows and/or columns) as needed to fit — exactly how pasting a
 *  range into Excel/Sheets past the current sheet edge works. */
export function pasteIntoGrid(
  base: string[][],
  incoming: string[][],
  startRow: number,
  startCol: number,
): string[][] {
  const neededRows = startRow + incoming.length;
  const neededCols = startCol + Math.max(...incoming.map((r) => r.length));
  const currentCols = base[0]?.length ?? 0;

  const grown = base.map((row) => {
    const copy = [...row];
    while (copy.length < neededCols) copy.push("");
    return copy;
  });
  while (grown.length < neededRows) {
    grown.push(Array(Math.max(neededCols, currentCols)).fill(""));
  }

  incoming.forEach((row, r) => {
    row.forEach((cell, c) => {
      grown[startRow + r][startCol + c] = cell;
    });
  });

  return grown;
}

/** Best-effort text -> number for Matrix cells. Empty/unparseable -> 0. */
export function toNumberCell(text: string): number {
  const n = Number(text.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}
