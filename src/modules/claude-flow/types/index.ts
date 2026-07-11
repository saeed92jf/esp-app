import type { Node, Edge, Viewport } from '@xyflow/react';
import type { ColorToken } from '../utils/colors';
import type { GeometryShape, GeometryMode, BeamShape } from '../utils/geometry';

export type DiagramNodeType =
  | 'defaultNode'
  | 'inputNode'
  | 'outputNode'
  | 'circleNode'
  | 'diamondNode'
  | 'cylinderNode'
  | 'parallelogramNode'
  | 'hexagonNode'
  | 'textNode'
  | 'noteNode'
  // â”€â”€ New shape nodes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  | 'triangleNode'
  | 'cloudNode'
  | 'documentNode'
  | 'predefinedProcessNode'
  | 'delayNode'
  // â”€â”€ Subflow / container node â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  | 'groupNode'
  // â”€â”€ Computing flows (https://reactflow.dev/learn/advanced-use/computing-flows) â”€â”€
  | 'numberNode'
  | 'operatorNode'
  // â”€â”€ Standalone geometry calculators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  | 'geometryCalcNode'
  | 'beamCalcNode'
  // â”€â”€ Pipeable shape definition â€” connect to a calculator's input handle â”€â”€
  | 'shapeNode'
  // â”€â”€ Image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  | 'imageNode'
  // â”€â”€ Vector / CAD file attachments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  | 'svgNode'
  | 'dwgNode'
  | 'dxfNode';

export type DiagramEdgeType = 'default' | 'straight' | 'step' | 'smoothstep' | 'floating';

export type ArithmeticOperation =
  // n-ary (1+ unordered inputs on one handle)
  | 'add'
  | 'multiply'
  | 'average'
  // binary (exactly 2 inputs, ORDER matters â€” handles "a" and "b")
  | 'subtract'
  | 'divide'
  | 'power'
  // unary (exactly 1 input â€” handle "x")
  | 'sqrt'
  | 'square'
  | 'abs'
  | 'negate';

/** How many inputs an operation needs, and whether their order matters â€”
 *  drives which handles operatorNode renders. See components/nodes/BaseNode.tsx. */
export type OperatorArity = 'nary' | 'binary' | 'unary';

/** Which pointer interaction dragging on empty canvas performs â€” see Toolbar's selection-tool toggle. */
export type SelectionTool = 'pointer' | 'box' | 'lasso';

/** Lasso hit-test: "partial" selects any node the lasso touches at all,
 *  "full" only selects nodes entirely enclosed by it.
 *  See https://reactflow.dev/examples/whiteboard/lasso-selection */
export type LassoMode = 'partial' | 'full';

export interface DiagramNodeData extends Record<string, unknown> {
  label: string;
  /** Token from a small fixed palette (utils/colors.ts), pre-tuned for light & dark.
   *  Takes priority over the raw hex fields below when set. */
  colorToken?: ColorToken;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'semibold' | 'bold';
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  description?: string;
  /** External link the node points to. Set via the settings panel; opened via
   *  double-click on the node or the link badge in its corner. Bare hosts
   *  ("example.com") are treated as https:// when opened. */
  url?: string;
  /** Persisted pixel size set by <NodeResizer>. Falls back to a per-shape
   *  default (see utils/shapes.ts) when a node hasn't been resized yet. */
  width?: number;
  height?: number;

  // â”€â”€ Computing flows (numberNode / operatorNode) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** numberNode: the user-entered input value. */
  value?: number;
  /** operatorNode: which arithmetic operation to apply to its incoming values. */
  operation?: ArithmeticOperation;
  /** operatorNode: live result, recomputed by the store whenever the graph or
   *  an upstream value changes (see store's recomputeValues). Read-only from
   *  the UI's point of view â€” always derived, never edited directly. */
  result?: number;

  // â”€â”€ Geometry calculator (perimeter / area / volume) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  calcShape?: GeometryShape;
  calcMode?: GeometryMode;
  calcInputs?: Record<string, number>;

  // â”€â”€ Beam second-moment-of-area calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  beamShape?: BeamShape;
  beamInputs?: Record<string, number>;

  // â”€â”€ Pipeable shape definition (shapeNode) â€” feeds geometryCalcNode /
  // beamCalcNode via an edge into their input handle. When a calculator is
  // connected to one of these, it uses this shape instead of its own
  // standalone calcShape/beamShape+inputs.
  shapeKind?: GeometryShape;
  shapeInputs?: Record<string, number>;

  // â”€â”€ Image node â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Data-URL (uploaded file) or external URL. */
  imageUrl?: string;

  // â”€â”€ SVG node â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  svgContent?: string;

  // â”€â”€ CAD file node (dwg/dxf) â€” can't render the drawing itself in-browser,
  // so this behaves as an attachment: keeps the original file (as a data-URL)
  // for re-download, plus its name/size for display.
  cadFileName?: string;
  cadFileType?: 'dwg' | 'dxf';
  cadFileDataUrl?: string;
  cadFileSize?: number;

  // â”€â”€ Rotation (imageNode + textNode) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Degrees, 0-360. See components/nodes/RotateHandle.tsx. */
  rotation?: number;
}

export interface DiagramEdgeData extends Record<string, unknown> {
  label?: string;
  animated?: boolean;
  /** Token from the shared palette (utils/colors.ts); takes priority over `color`. */
  colorToken?: ColorToken;
  color?: string;
  strokeWidth?: number;
  edgeStyle?: DiagramEdgeType;
  /** Arrowhead toggles â€” rendered via the edge's top-level markerStart/markerEnd. */
  arrowStart?: boolean;
  arrowEnd?: boolean;
}

export interface SavedDiagram {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodes: Node<DiagramNodeData>[];
  edges: Edge<DiagramEdgeData>[];
  viewport: Viewport;
}

export interface HistoryEntry {
  nodes: Node<DiagramNodeData>[];
  edges: Edge<DiagramEdgeData>[];
}

export interface EditorSettings {
  snapToGrid: boolean;
  snapGrid: [number, number];
  showMiniMap: boolean;
  showControls: boolean;
  backgroundVariant: 'dots' | 'lines' | 'cross' | 'none';
  colorMode: 'light' | 'dark';
  defaultEdgeType: DiagramEdgeType;
  autoSave: boolean;
  /** While dragging a node, nearby nodes get shoved out of the way instead of overlapping.
   *  See https://reactflow.dev/examples/layout/node-collisions */
  collisionAvoidance: boolean;
}

export type Language = 'en' | 'fa';

export interface PaletteItem {
  type: DiagramNodeType;
  labelKey: string;
  icon: string;
  defaultData: Partial<DiagramNodeData>;
  category: 'basic' | 'flowchart' | 'shapes' | 'containers' | 'compute';
}

export type { ColorToken } from '../utils/colors';


