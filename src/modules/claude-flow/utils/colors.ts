// src/modules/claude-flow/utils/colors.ts
// ─────────────────────────────────────────────────────────────────────────
// A deliberately SMALL, curated set of colors ("tokens") for nodes & edges.
// Each token carries a matched light-mode and dark-mode value so the whole
// diagram stays legible and coherent when the user flips settings.colorMode,
// instead of exposing an unrestricted color wheel.
//
// Backward compatible: existing diagrams that already stored raw hex values
// in data.backgroundColor / borderColor / textColor / color keep working —
// a token simply takes priority over those when present (see resolve* below).
// ─────────────────────────────────────────────────────────────────────────

export type ColorMode = 'light' | 'dark';

export type ColorToken =
  | 'neutral'
  | 'red'
  | 'amber'
  | 'green'
  | 'teal'
  | 'blue'
  | 'violet'
  | 'pink';

export const COLOR_TOKEN_ORDER: ColorToken[] = [
  'neutral',
  'red',
  'amber',
  'green',
  'teal',
  'blue',
  'violet',
  'pink',
];

interface NodeTokenColors {
  bg: string;
  border: string;
  text: string;
}

interface NodeTokenModes {
  light: NodeTokenColors;
  dark: NodeTokenColors;
}

/** Node fill / border / text triplets — chosen so text stays readable on bg in both modes. */
export const NODE_COLOR_TOKENS: Record<ColorToken, NodeTokenModes> = {
  neutral: {
    light: { bg: '#f8fafc', border: '#94a3b8', text: '#0f172a' },
    dark: { bg: '#1e293b', border: '#64748b', text: '#f1f5f9' },
  },
  red: {
    light: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
    dark: { bg: '#3f1d1d', border: '#f87171', text: '#fecaca' },
  },
  amber: {
    light: { bg: '#fef9c3', border: '#eab308', text: '#713f12' },
    dark: { bg: '#3f2d0a', border: '#facc15', text: '#fde68a' },
  },
  green: {
    light: { bg: '#dcfce7', border: '#22c55e', text: '#14532d' },
    dark: { bg: '#0f2e1c', border: '#4ade80', text: '#bbf7d0' },
  },
  teal: {
    light: { bg: '#ccfbf1', border: '#14b8a6', text: '#134e4a' },
    dark: { bg: '#0b2e2b', border: '#2dd4bf', text: '#99f6e4' },
  },
  blue: {
    light: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
    dark: { bg: '#132447', border: '#60a5fa', text: '#bfdbfe' },
  },
  violet: {
    light: { bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' },
    dark: { bg: '#241b40', border: '#a78bfa', text: '#ddd6fe' },
  },
  pink: {
    light: { bg: '#fce7f3', border: '#ec4899', text: '#831843' },
    dark: { bg: '#3a1530', border: '#f472b6', text: '#fbcfe8' },
  },
};

/** Edge stroke colors — same hue family as the node tokens for a unified look. */
export const EDGE_COLOR_TOKENS: Record<ColorToken, { light: string; dark: string }> = {
  neutral: { light: '#94a3b8', dark: '#94a3b8' },
  red: { light: '#ef4444', dark: '#f87171' },
  amber: { light: '#eab308', dark: '#facc15' },
  green: { light: '#22c55e', dark: '#4ade80' },
  teal: { light: '#14b8a6', dark: '#2dd4bf' },
  blue: { light: '#3b82f6', dark: '#60a5fa' },
  violet: { light: '#8b5cf6', dark: '#a78bfa' },
  pink: { light: '#ec4899', dark: '#f472b6' },
};

interface ResolvableNodeData {
  colorToken?: ColorToken;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

interface ResolvableEdgeData {
  colorToken?: ColorToken;
  color?: string;
}

/** Resolves the effective {background, border, text} for a node given the active color mode. */
export function resolveNodeColors(
  data: ResolvableNodeData | undefined,
  mode: ColorMode,
): { background: string; border: string; text: string } {
  const token = data?.colorToken;
  if (token && NODE_COLOR_TOKENS[token]) {
    const t = NODE_COLOR_TOKENS[token][mode];
    return { background: t.bg, border: t.border, text: t.text };
  }
  return {
    background: data?.backgroundColor ?? (mode === 'dark' ? '#1e293b' : '#ffffff'),
    border: data?.borderColor ?? (mode === 'dark' ? '#64748b' : '#cbd5e1'),
    text: data?.textColor ?? (mode === 'dark' ? '#f1f5f9' : '#0f172a'),
  };
}

/** Resolves the effective stroke color for an edge given the active color mode. */
export function resolveEdgeColor(data: ResolvableEdgeData | undefined, mode: ColorMode): string {
  const token = data?.colorToken;
  if (token && EDGE_COLOR_TOKENS[token]) return EDGE_COLOR_TOKENS[token][mode];
  return data?.color ?? (mode === 'dark' ? '#64748b' : '#94a3b8');
}
