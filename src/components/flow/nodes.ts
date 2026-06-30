// Import from @xyflow/react instead of reactflow
import { Node, Edge } from "@xyflow/react";

// Make BaseNodeData compatible with Node<T> requirement
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  category?: string;
  description?: string;
  isHovered?: boolean;
  isSelected?: boolean;
}

export interface HubNodeData extends BaseNodeData {
  type: "hub";
}

export interface CategoryNodeData extends BaseNodeData {
  type: "category";
}

export interface SubcategoryNodeData extends BaseNodeData {
  type: "subcategory";
}

export interface StandardNodeData extends BaseNodeData {
  type: "standard";
  standardType: "API" | "ASME" | "ASTM" | "NACE" | "NBIC" | "OTHER";
  standardNumber: string;
  fullName: string;
  url?: string;
}

export type NodeData =
  | HubNodeData
  | CategoryNodeData
  | SubcategoryNodeData
  | StandardNodeData;

export type DiagramNode = Node<NodeData>;
export type DiagramEdge = Edge;

// ✅ Add StandardType export
export type StandardType =
  | "API"
  | "ASME"
  | "ASTM"
  | "NACE"
  | "NBIC"
  | "TEMA"
  | "AHRI"
  | "MSS"
  | "STI"
  | "ANSI"
  | "PFI"
  | "OTHER";

// Standard colors mapping with hover variants
export const STANDARD_COLORS: Record<StandardType, string> = {
  API: "#3b82f6", // blue-500
  ASME: "#8b5cf6", // violet-500
  ASTM: "#ec4899", // pink-500
  NACE: "#f59e0b", // amber-500
  NBIC: "#10b981", // emerald-500
  TEMA: "#06b6d4", // cyan-500
  AHRI: "#14b8a6", // teal-500
  MSS: "#84cc16", // lime-500
  STI: "#eab308", // yellow-500
  ANSI: "#f97316", // orange-500
  PFI: "#ef4444", // red-500
  OTHER: "#6b7280", // gray-500
} as const;

// Hover state colors (lighter variants)
export const STANDARD_COLORS_HOVER: Record<StandardType, string> = {
  API: "#60a5fa", // blue-400
  ASME: "#a78bfa", // violet-400
  ASTM: "#f472b6", // pink-400
  NACE: "#fbbf24", // amber-400
  NBIC: "#34d399", // emerald-400
  TEMA: "#22d3ee", // cyan-400
  AHRI: "#2dd4bf", // teal-400
  MSS: "#a3e635", // lime-400
  STI: "#fde047", // yellow-400
  ANSI: "#fb923c", // orange-400
  PFI: "#f87171", // red-400
  OTHER: "#9ca3af", // gray-400
} as const;
export const HUB_COLOR = "#1e293b";
export const CATEGORY_COLOR = "#475569";
export const SUBCATEGORY_COLOR = "#64748b";

export function getStandardColor(standardType: StandardType): string {
  return STANDARD_COLORS[standardType] || STANDARD_COLORS.OTHER;
}
export function getStandardHoverColor(standardType: StandardType): string {
  return STANDARD_COLORS_HOVER[standardType] || STANDARD_COLORS_HOVER.OTHER;
}
