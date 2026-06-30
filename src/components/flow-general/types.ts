// src/components/flow-general/types.ts
/**
 * Type definitions for the general-purpose flow editor.
 */

import type { Node, Edge, ConnectionLineType } from "@xyflow/react";
import type React from "react";

// ==================== Shape Definitions ====================

export type ShapeType =
  | "circle"
  | "rectangle"
  | "rounded-rectangle"
  | "hexagon"
  | "octagon"
  | "diamond"
  | "ellipse"
  | "parallelogram"
  | "trapezoid";

// ==================== Handle Definitions ====================

export type HandlePosition = "top" | "right" | "bottom" | "left";

export type HandleType = "source" | "target";

export interface HandleDefinition {
  id: string;
  type: HandleType;
  position: HandlePosition;
  label?: string;
}

// ==================== Node Type Definitions ====================

/**
 * User-defined node type configuration.
 */
export interface CustomNodeType {
  id: string;
  label: string;
  shape: ShapeType;
  color: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  handles: HandleDefinition[];
  width?: number;
  height?: number;
  icon?: string;
  allowResize?: boolean;
  metadata?: Record<string, any>;
  /** For compatibility with older components */
  type?: string;
}

/**
 * Runtime data stored in each node instance.
 * Satisfies React Flow's Record<string, unknown> constraint.
 */
export interface DynamicNodeData extends Record<string, unknown> {
  nodeTypeId: string;
  label: string;
  customFields?: Record<string, any>;
}

// ==================== Connection Type Definitions ====================

export type EdgePathStyle =
  | "default"
  | "bezier"
  | "smoothstep"
  | "step"
  | "straight";

export interface EdgeAnimation {
  enabled: boolean;
  duration?: number;
  direction?: "forward" | "reverse";
}

/**
 * User-defined connection type configuration.
 */
export interface CustomConnectionType {
  id: string;
  label: string;
  pathStyle: EdgePathStyle;
  color: string;
  strokeWidth: number;
  strokeDasharray?: string;
  animation?: EdgeAnimation;
  showArrow: boolean;
  allowLabel: boolean;
  allowedConnections?: string[];
}

/**
 * Runtime data stored in each edge instance.
 */
export interface DynamicEdgeData extends Record<string, unknown> {
  connectionTypeId: string;
  label?: string;
  customFields?: Record<string, any>;
}

// ==================== Diagram Definition ====================

export interface DiagramDefinition {
  version: string;
  customNodeTypes: CustomNodeType[];
  customConnectionTypes: CustomConnectionType[];
  nodes: Node<DynamicNodeData>[];
  edges: Edge<DynamicEdgeData>[];
  metadata?: {
    title?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// ==================== Registry State ====================

export interface RegistryState {
  nodeTypes: Map<string, CustomNodeType>;
  connectionTypes: Map<string, CustomConnectionType>;
}

// ==================== Flow Editor Specific Types ====================

export type FlowNode = Node<DynamicNodeData>;
export type FlowEdge = Edge<DynamicEdgeData>;

export interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowEditorProps {
  initialNodes?: FlowNode[];
  initialEdges?: FlowEdge[];
  nodeTypeConfigs?: CustomNodeType[];
  connectionTypeConfigs?: CustomConnectionType[];
  onSave?: (state: FlowState) => void;
  onLoad?: () => FlowState | null | Promise<FlowState | null>;
  autoSave?: boolean;
  autoSaveInterval?: number;
  storageKey?: string;
  className?: string;
  showBackground?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
  connectionLineType?: ConnectionLineType;
  fitView?: boolean;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  children?: React.ReactNode;
}

// ==================== Backward Compatibility Aliases ====================

export type NodeTypeConfig = CustomNodeType;
export type ConnectionTypeConfig = CustomConnectionType;
export type NodeType = CustomNodeType;
export type ConnectionType = CustomConnectionType;
