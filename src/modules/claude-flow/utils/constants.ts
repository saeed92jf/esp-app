// src/modules/claude-flow/utils/constants.ts
// Dimensionless numbers — no unit picker on purpose, since these are pure
// numbers by definition (unlike NumberNode's arbitrary user-typed value,
// which very much can carry a unit of its own).

export interface MathConstant {
  key: string;
  symbol: string;
  name: string;
  value: number;
  description: string;
}

export const MATH_CONSTANTS: MathConstant[] = [
  { key: "pi", symbol: "π", name: "Pi", value: Math.PI, description: "Ratio of a circle's circumference to its diameter." },
  { key: "e", symbol: "e", name: "Euler's number", value: Math.E, description: "Base of the natural logarithm; limit of (1 + 1/n)ⁿ." },
  { key: "phi", symbol: "φ", name: "Golden ratio", value: (1 + Math.sqrt(5)) / 2, description: "(1 + √5) / 2 — the classic golden-ratio proportion." },
  { key: "sqrt2", symbol: "√2", name: "Square root of 2", value: Math.SQRT2, description: "Length of the diagonal of a unit square." },
  { key: "sqrt3", symbol: "√3", name: "Square root of 3", value: Math.sqrt(3), description: "Height of an equilateral triangle with side 2." },
  { key: "ln2", symbol: "ln 2", name: "Natural log of 2", value: Math.LN2, description: "Natural logarithm of 2 — half-life/doubling-time constant." },
  { key: "ln10", symbol: "ln 10", name: "Natural log of 10", value: Math.LN10, description: "Natural logarithm of 10." },
  { key: "eulerGamma", symbol: "γ", name: "Euler–Mascheroni constant", value: 0.5772156649015329, description: "Limiting difference between the harmonic series and ln(n)." },
  { key: "twoPi", symbol: "2π", name: "Tau (2π)", value: 2 * Math.PI, description: "One full turn in radians." },
  { key: "halfPi", symbol: "π/2", name: "Pi over 2", value: Math.PI / 2, description: "A quarter turn in radians." },
];

export const MATH_CONSTANT_BY_KEY: Record<string, MathConstant> = Object.fromEntries(
  MATH_CONSTANTS.map((c) => [c.key, c]),
);

export const MATH_CONSTANT_OPTIONS = MATH_CONSTANTS.map((c) => ({
  value: c.key,
  label: `${c.symbol} — ${c.name}`,
}));
