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

// Standard colors mapping
export const STANDARD_COLORS = {
  API: "#3b82f6",
  ASME: "#8b5cf6",
  ASTM: "#ec4899",
  NACE: "#f59e0b",
  NBIC: "#10b981",
  OTHER: "#6b7280",
} as const;

export const HUB_COLOR = "#1e293b";
export const CATEGORY_COLOR = "#475569";
export const SUBCATEGORY_COLOR = "#64748b";

export function getStandardColor(
  standardType: keyof typeof STANDARD_COLORS,
): string {
  return STANDARD_COLORS[standardType] || STANDARD_COLORS.OTHER;
}
