// src/modules/esp-flow/utils/handles.ts

/**
 * 1. Neutral / General Handle (Circle - دایره):
 * Used on standard diagram nodes (shapes, notes, bidirectional connections).
 * Geometry: Circle (rounded-full)
 */
export const FLOW_HANDLE_NEUTRAL =
  "cf-handle cf-handle-circle h-2.5! w-2.5! rounded-full! border-2! border-white! dark:border-slate-900! bg-slate-400! dark:bg-slate-500! hover:bg-primary! hover:border-primary-foreground! relative after:absolute after:-inset-2 after:content-[''] cursor-crosshair! shadow-xs";

/**
 * 2. Source Handle (Diamond - لوزی):
 * Used on nodes and handles that output or emit values (calculators, value-out, vessel source handles).
 * Geometry: Diamond (rotate-45 with exact diagonal center alignment)
 */
export const FLOW_HANDLE_SOURCE =
  "cf-handle cf-handle-diamond h-2.5! w-2.5! rounded-[1px]! border-2! border-white! dark:border-slate-900! bg-slate-400! dark:bg-slate-500! hover:bg-primary! hover:border-primary-foreground! relative after:absolute after:-inset-2 after:content-[''] cursor-crosshair! shadow-xs";

/**
 * 3. Target Handle (Square - مربع):
 * Used on nodes and handles that receive values (calculators, shape-in, operators, vessel target handles).
 * Geometry: Square (rounded-[1.5px] with exact center alignment)
 */
export const FLOW_HANDLE_TARGET =
  "cf-handle cf-handle-square h-2.5! w-2.5! rounded-[1.5px]! border-2! border-white! dark:border-slate-900! bg-slate-400! dark:bg-slate-500! hover:bg-primary! hover:border-primary-foreground! relative after:absolute after:-inset-2 after:content-[''] cursor-crosshair! shadow-xs";

/** Default fallback handle class */
export const FLOW_HANDLE_CLASS = FLOW_HANDLE_NEUTRAL;

export const FLOW_HANDLE_CIRCLE = FLOW_HANDLE_NEUTRAL;
export const FLOW_HANDLE_DIAMOND = FLOW_HANDLE_SOURCE;
export const FLOW_HANDLE_SQUARE = FLOW_HANDLE_TARGET;

export const FLOW_HANDLE_STYLES = {
  neutral: FLOW_HANDLE_NEUTRAL,
  circle: FLOW_HANDLE_CIRCLE,
  source: FLOW_HANDLE_SOURCE,
  diamond: FLOW_HANDLE_DIAMOND,
  target: FLOW_HANDLE_TARGET,
  square: FLOW_HANDLE_SQUARE,
};
