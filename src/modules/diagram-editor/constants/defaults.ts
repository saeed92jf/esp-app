import type { NodeStyleData, DiagramEdgeData } from "../types/diagram.types";
// Default visual style applied to every newly created node
export const DEFAULT_NODE_STYLE: NodeStyleData = {
  backgroundColor: "#ffffff",
  borderColor: "#6366f1",
  borderWidth: 2,
  borderRadius: 8,
  textColor: "#1e1e2e",
  fontSize: 14,
  fontWeight: "medium",
  opacity: 1,
  shadow: "sm",
  animation: "none",
};
// Default pixel size for new nodes
export const DEFAULT_NODE_SIZE = {
  width: 160,
  height: 60,
};
// Default visual style applied to every newly created edge
export const DEFAULT_EDGE_STYLE: Omit<DiagramEdgeData, "label"> = {
  strokeColor: "#6366f1",
  strokeWidth: 2,
  lineStyle: "solid",
  arrowStart: "none",
  arrowEnd: "arrowclosed",
  animated: false,
};
// Canvas grid cell size in pixels
export const GRID_SIZE = 20;
// Whether nodes snap to the grid when dragged
export const SNAP_TO_GRID = true;
// Minimum zoom level allowed
export const MIN_ZOOM = 0.1;
// Maximum zoom level allowed
export const MAX_ZOOM = 4;
// Default zoom level on canvas reset
export const DEFAULT_ZOOM = 1;
// Transition duration in ms for UI animations
export const ANIMATION_DURATION = 200;
// Preset color swatches shown in color pickers
export const COLOR_PRESETS = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#06b6d4",
  "#1e1e2e",
  "#000000",
];
// Lucide icon names available for node icons
export const AVAILABLE_ICONS = [
  "box",
  "circle",
  "triangle",
  "star",
  "heart",
  "cloud",
  "database",
  "server",
  "cpu",
  "network",
  "shield",
  "lock",
  "key",
  "user",
  "users",
  "file",
  "folder",
  "code",
  "terminal",
  "globe",
  "zap",
  "activity",
  "alert",
  "check",
  "x",
];

export const AVAILABLE_SHAPES = [];

// Human-readable keyboard shortcut descriptions
export const KEYBOARD_SHORTCUTS = {
  undo: "Ctrl+Z",
  redo: "Ctrl+Y",
  delete: "Delete / Backspace",
  selectMode: "V",
  panMode: "H",
  connectMode: "C",
  fitView: "Ctrl+Shift+F",
  zoomIn: "Ctrl+=",
  zoomOut: "Ctrl+-",
  selectAll: "Ctrl+A",
  copy: "Ctrl+C",
  paste: "Ctrl+V",
};
// Fixed pixel widths for the side panels
export const PANEL_WIDTH = {
  palette: 220,
  inspector: 280,
};
// Debounce delay in ms for autosave triggers
export const DEBOUNCE_DELAY = 800;
