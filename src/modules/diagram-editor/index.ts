// src/modules/diagram-editor/index.ts
// Public API for the diagram-editor module.
// Only export what consumers need — internals stay encapsulated.

// ── Main component (use this in pages/routes) ─────────────────────────────
export { DiagramEditorWithProvider as DiagramEditor } from "./DiagramEditor";

// ── Types consumers may need ──────────────────────────────────────────────
export type {
  DiagramDocument,
  DiagramNodeData,
  DiagramEdgeData,
  NodeShape,
  NodeStyleData,
  EdgeLineStyle,
  EdgeArrowType,
} from "./types/diagram.types";

// ── Store hook — for reading diagram state from outside the module ─────────
export { useDiagramStore } from "./store/diagramStore";

// ── Import/export utilities ───────────────────────────────────────────────
export {
  exportDiagramAsJson,
  importDiagramFromFile,
  validateDiagramDocument,
} from "./utils/exportImport";
