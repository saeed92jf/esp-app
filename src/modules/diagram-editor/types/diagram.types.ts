import type {
  Node,
  Edge,
  Viewport,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
// Available shape types for diagram nodes

// Animation types for node visual effects
export type NodeAnimation = "none" | "pulse" | "bounce" | "spin" | "ping";
// Visual style properties for a node
export interface NodeStyleData {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  textColor: string;
  fontSize: number;
  fontWeight: "normal" | "medium" | "semibold" | "bold";
  opacity: number;
  shadow: "none" | "sm" | "md" | "lg" | "xl";
  animation: NodeAnimation;
}
// Data payload attached to each diagram node
export interface DiagramNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  shape: NodeShape;
  icon?: string;
  style: NodeStyleData;
  locked?: boolean;
  group?: string;
}
// Line style for edges
export type EdgeLineStyle = "solid" | "dashed" | "dotted";
// Arrow marker types for edge endpoints
export type EdgeArrowType = "arrow" | "arrowclosed" | "none";
// Data payload attached to each diagram edge
export interface DiagramEdgeData extends Record<string, unknown> {
  label?: string;
  strokeColor: string;
  strokeWidth: number;
  lineStyle: EdgeLineStyle;
  arrowStart: EdgeArrowType;
  arrowEnd: EdgeArrowType;
  animated: boolean;
}
// Typed React Flow node using our custom data
// اصلاح تایپ برای سازگاری با ReactFlow/XYFlow
export interface DiagramNode extends Omit<Node, "extent"> {
  data: DiagramNodeData;
  extent?: "parent" | [[number, number], [number, number]]; // حذف null برای رفع خطا
}

// اطمینان از وجود این تابع برای استفاده در پالت
export type NodeShape =
  | "rectangle"
  | "rounded-rectangle"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "parallelogram"
  | "trapezoid"
  | "hexagon"
  | "octagon"
  | "cylinder"
  | "cloud"
  | "star"
  | "cross"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down";

// اضافه کردن متغیر گمشده برای Inspector
export const AVAILABLE_SHAPES: NodeShape[] = [
  "rectangle",
  "rounded-rectangle",
  "ellipse",
  "diamond",
  "triangle",
  "parallelogram",
  "trapezoid",
  "hexagon",
  "octagon",
  "cylinder",
  "cloud",
  "star",
  "cross",
  "arrow-right",
  "arrow-left",
  "arrow-up",
  "arrow-down",
];

// Typed React Flow edge using our custom data
export type DiagramEdge = Edge<DiagramEdgeData>;
// Full serializable diagram document for save/load
export interface DiagramDocument {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: Viewport;
  meta?: Record<string, unknown>;
}
// A snapshot of nodes+edges for undo/redo history
export interface HistorySnapshot {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
// Currently selected node and edge ids
export interface SelectionState {
  nodeIds: string[];
  edgeIds: string[];
}
// Which side panel is currently open
export type ActivePanel = "inspector" | "minimap" | "json" | null;
// Editor interaction mode
export type EditorMode = "select" | "pan" | "connect";
// Full Zustand store shape for diagram editor
export interface DiagramStore {
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setSelection: (nodeIds: string[], edgeIds: string[]) => void;
  // Core diagram data
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: Viewport;
  // UI state
  selection: SelectionState;
  activePanel: ActivePanel;
  editorMode: EditorMode;
  isDirty: boolean;
  // Undo/redo history stacks
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  // Diagram metadata
  diagramName: string;
  diagramId: string;
  // React Flow change handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  // Node actions
  addNode: (shape: NodeShape, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<DiagramNodeData>) => void;
  deleteSelectedNodes: () => void;
  // Edge actions
  updateEdgeData: (edgeId: string, data: Partial<DiagramEdgeData>) => void;
  // Selection actions
  clearSelection: () => void;
  // UI actions
  setActivePanel: (panel: ActivePanel) => void;
  setEditorMode: (mode: EditorMode) => void;
  setViewport: (viewport: Viewport) => void;
  setDiagramName: (name: string) => void;
  // History actions
  undo: () => void;
  redo: () => void;
  // Document actions
  loadDocument: (doc: DiagramDocument) => void;
  resetDiagram: () => void;
  buildDocument: () => DiagramDocument;
}
