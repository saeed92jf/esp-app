// src/modules/claude-flow/utils/units.ts
// ─────────────────────────────────────────────────────────────────────────
// Purely a DISPLAY label, not a conversion system: picking "cm" doesn't
// rescale numbers you already typed in "mm". It just tags a calculator
// node's inputs/result with the unit they're meant to be in, and — for
// geometry/beam results — automatically appends the right power (mm, mm²,
// mm³, mm⁴) based on what the node is actually computing.
// ─────────────────────────────────────────────────────────────────────────

export const LENGTH_UNITS = ["mm", "cm", "m", "in", "ft"] as const;
export type LengthUnit = (typeof LENGTH_UNITS)[number];

export const UNIT_OPTIONS: { value: string; label: string }[] = LENGTH_UNITS.map((u) => ({ value: u, label: u }));

const POWER_SUPERSCRIPT: Record<2 | 3 | 4, string> = { 2: "²", 3: "³", 4: "⁴" };

/** "mm" + power 3 -> "mm³". Power 1 (or no unit set) returns the unit as-is. */
export function unitWithPower(unit: string | undefined, power: 1 | 2 | 3 | 4): string {
  if (!unit) return "";
  if (power === 1) return unit;
  return `${unit}${POWER_SUPERSCRIPT[power]}`;
}

/** Geometry calc results are a length (perimeter), area, or volume — the
 *  power to raise the unit to depends on which mode is active. */
export function geometryModePower(mode: "perimeter" | "area" | "volume"): 1 | 2 | 3 {
  if (mode === "perimeter") return 1;
  if (mode === "area") return 2;
  return 3;
}
