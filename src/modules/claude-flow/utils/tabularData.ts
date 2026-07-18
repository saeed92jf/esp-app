// src/modules/claude-flow/utils/tabularData.ts
// Parses text copied from Excel/Sheets (tab-separated) or a plain .csv file
// (comma-separated) into a simple string[][] grid — used for clipboard
// paste, which is always plain text no matter the source. Real binary
// .xlsx/.xls files go through parseSpreadsheetFile below (SheetJS), further
// down in this file.

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

/**
 * Reads an uploaded file into a string[][] grid — routes to real binary
 * .xlsx/.xls parsing (via SheetJS, lazy-imported so it doesn't add to every
 * page's bundle, only when someone actually imports a spreadsheet) or plain
 * text parsing for .csv/.tsv/.txt, based on the file's extension.
 */
export async function parseSpreadsheetFile(file: File): Promise<string[][]> {
  const isBinaryExcel = /\.(xlsx|xls)$/i.test(file.name);

  if (isBinaryExcel) {
    // NOTE: requires the "xlsx" package — see package.json / README for the
    // `npm install` step. Until that's run, TypeScript can't find real types
    // for this module, so the import result is typed loosely on purpose
    // (no generic type-argument on sheet_to_json, and an explicit cast on
    // its result) — this keeps every callback below fully typed either way,
    // instead of every 'row'/'cell'/'r' silently becoming 'any'.
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [[""]];
    const sheet = workbook.Sheets[firstSheetName];
    // header: 1 -> array-of-arrays (exactly our string[][] shape), instead
    // of the default array-of-objects-keyed-by-header-row.
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as (string | number | boolean | null)[][];
    const stringRows: string[][] = rows.map((row: (string | number | boolean | null)[]) =>
      row.map((cell: string | number | boolean | null) => (cell === null || cell === undefined ? "" : String(cell))),
    );
    if (stringRows.length === 0) return [[""]];
    const width = Math.max(...stringRows.map((r: string[]) => r.length));
    return stringRows.map((r: string[]) => (r.length < width ? [...r, ...Array(width - r.length).fill("")] : r));
  }

  const text = await file.text();
  return parseDelimitedText(text);
}
