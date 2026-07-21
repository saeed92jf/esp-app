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
  // ── New shape nodes ──────────────────────────────────────────────
  | 'triangleNode'
  | 'cloudNode'
  | 'documentNode'
  | 'predefinedProcessNode'
  | 'delayNode'
  // ── Subflow / container node ─────────────────────────────────────
  | 'groupNode'
  // ── Computing flows (https://reactflow.dev/learn/advanced-use/computing-flows) ──
  | 'numberNode'
  | 'operatorNode'
  | 'constantNode'
  | 'tableNode'
  | 'excelNode'
  | 'matrixNode'
  | 'chartNode'
  // ── Standalone geometry calculators ──────────────────────────────
  | 'geometryCalcNode'
  | 'beamCalcNode'
  // ── Pipeable shape definition — connect to a calculator's input handle ──
  | 'shapeNode'
  // ── Image ─────────────────────────────────────────────────────────────
  // svgNode kept only so diagrams saved before Image+SVG were merged still
  // load — it's registered to the very same ImageNode component now (see
  // components/nodes/BaseNode.tsx). Nothing new should ever be created with
  // type "svgNode"; the palette only offers "imageNode" going forward.
  | 'imageNode'
  | 'svgNode';

export type DiagramEdgeType = 'default' | 'straight' | 'step' | 'smoothstep' | 'floating' | 'floating-straight';

export type ArithmeticOperation =
  // n-ary (1+ unordered inputs on one handle)
  | 'add'
  | 'multiply'
  | 'average'
  // binary (exactly 2 inputs, ORDER matters — handles "a" and "b")
  | 'subtract'
  | 'divide'
  | 'power'
  // unary (exactly 1 input — handle "x")
  | 'sqrt'
  | 'square'
  | 'abs'
  | 'negate';

/** How many inputs an operation needs, and whether their order matters —
 *  drives which handles operatorNode renders. See components/nodes/BaseNode.tsx. */
export type OperatorArity = 'nary' | 'binary' | 'unary';

/** Which pointer interaction dragging on empty canvas performs — see Toolbar's selection-tool toggle. */
export type SelectionTool = 'pointer' | 'box' | 'lasso';

/** Lasso hit-test: "partial" selects any node the lasso touches at all,
 *  "full" only selects nodes entirely enclosed by it.
 *  See https://reactflow.dev/examples/whiteboard/lasso-selection */
export type LassoMode = 'partial' | 'full';

export interface DiagramNodeData extends Record<string, unknown> {
  label: string;
  /** When true, `label` is rendered as raw HTML (dangerouslySetInnerHTML)
   *  instead of plain text — lets Label/Text/Note nodes hold rich content
   *  (bold, links, line breaks via <br>, etc). Off by default: plain text. */
  isRichText?: boolean;
  /** Display-only unit tag for calculator nodes (NumberNode, OperatorNode,
   *  GeometryCalcNode, BeamCalcNode, ShapeNode) — e.g. "mm", "cm". Purely a
   *  label; doesn't rescale any numbers. See utils/units.ts. */
  unit?: string;
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

  // ── Computing flows (numberNode / operatorNode) ──────────────────────
  /** numberNode: the user-entered input value. */
  value?: number;
  /** operatorNode: which arithmetic operation to apply to its incoming values. */
  operation?: ArithmeticOperation;
  /** operatorNode: live result, recomputed by the store whenever the graph or
   *  an upstream value changes (see store's recomputeValues). Read-only from
   *  the UI's point of view — always derived, never edited directly. */
  result?: number;
  /** constantNode: which dimensionless constant (π, e, φ, ...) it outputs.
   *  See utils/constants.ts for the full list. Defaults to "pi". */
  constantKey?: string;

  // ── Table node ─────────────────────────────────────────────────────
  /** tableNode: the grid itself — tableRows[r][c] is that cell's text.
   *  All rows are kept the same length (padded/trimmed together whenever a
   *  column is added/removed) so indexing never goes out of bounds. */
  tableRows?: string[][];
  /** tableNode: whether the first row renders as a styled header. */
  tableHasHeader?: boolean;

  // ── Matrix node ────────────────────────────────────────────────────
  /** matrixNode: a strictly-numeric grid (paste from Excel coerces text to
   *  numbers via utils/tabularData's toNumberCell). Same row-major shape as
   *  tableRows, kept separate since it's numbers, not free text. */
  matrixRows?: number[][];

  // ── Chart node ─────────────────────────────────────────────────────
  /** chartNode: its own data when not fed by an upstream Table/Excel/Matrix
   *  node — first row = series names (column headers), first cell of every
   *  other row = that row's category label. */
  chartRows?: string[][];
  /** chartNode: bar or line rendering (via recharts). */
  chartType?: 'bar' | 'line';
  /** chartNode: whether the inline data-entry grid is expanded. Only
   *  relevant (and only shown) when there's no upstream Table/Excel/Matrix
   *  node feeding it. */
  chartShowEditor?: boolean;

  // ── Geometry calculator (perimeter / area / volume) ──────────────────
  calcShape?: GeometryShape;
  calcMode?: GeometryMode;
  calcInputs?: Record<string, number>;

  // ── Beam second-moment-of-area calculator ────────────────────────────
  beamShape?: BeamShape;
  beamInputs?: Record<string, number>;

  // ── Pipeable shape definition (shapeNode) — feeds geometryCalcNode /
  // beamCalcNode via an edge into their input handle. When a calculator is
  // connected to one of these, it uses this shape instead of its own
  // standalone calcShape/beamShape+inputs.
  shapeKind?: GeometryShape;
  shapeInputs?: Record<string, number>;

  // ── Image node (also renders old "svgNode" diagrams — see DiagramNodeType) ──
  /** Data-URL (uploaded file) or external URL. */
  imageUrl?: string;
  /** 0-100. Defaults to 100 (fully opaque). */
  opacity?: number;

  /** @deprecated unused — kept only so old saved diagrams don't error on load. */
  svgContent?: string;

  // ── Rotation (imageNode + textNode) ──────────────────────────────────
  /** Degrees, 0-360. See components/nodes/RotateHandle.tsx. */
  rotation?: number;

  // ── Sub-flow (groupNode) label ────────────────────────────────────────
  /** Which edge the sub-flow's title bar sits on. Defaults to "top". Its
   *  font size reuses the regular `fontSize` field above. */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export interface DiagramEdgeData extends Record<string, unknown> {
  label?: string;
  animated?: boolean;
  /** Token from the shared palette (utils/colors.ts); takes priority over `color`. */
  colorToken?: ColorToken;
  color?: string;
  strokeWidth?: number;
  edgeStyle?: DiagramEdgeType;
  /** Arrowhead toggles — rendered via the edge's top-level markerStart/markerEnd. */
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
