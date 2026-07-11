export { DiagramEditor } from "./components/DiagramEditor";
export type { DiagramEditorProps } from "./components/DiagramEditor";

export { useDiagramStore } from "./store";

export type {
  DiagramNodeType,
  DiagramEdgeType,
  DiagramNodeData,
  DiagramEdgeData,
  SavedDiagram,
  EditorSettings,
  Language,
  ColorToken,
  ArithmeticOperation,
  OperatorArity,
  SelectionTool,
  LassoMode,
} from "./types";

export {
  COLOR_TOKEN_ORDER,
  NODE_COLOR_TOKENS,
  EDGE_COLOR_TOKENS,
  resolveNodeColors,
  resolveEdgeColor,
} from "./utils/colors";

export { OPERATOR_ARITY, OPERATOR_SYMBOL, OPERATOR_LABEL, evaluateOperator } from "./utils/operators";

export type { GeometryShape, GeometryMode, BeamShape } from "./utils/geometry";
export {
  GEOMETRY_SHAPE_FIELDS,
  GEOMETRY_SHAPE_MODES,
  computeGeometry,
  BEAM_SHAPE_FIELDS,
  computeSecondMomentOfArea,
  isBeamCompatible,
  toBeamInputs,
} from "./utils/geometry";



