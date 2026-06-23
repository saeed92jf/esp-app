// src/components/flow/edges/index.ts
import type { BuiltInEdge, EdgeTypes } from "@xyflow/react";

// ButtonEdge exports: default component + named type `ButtonEdgeType`
import ButtonEdge, { type ButtonEdgeType } from "./ButtonEdge";

export { ButtonEdge };
export type { ButtonEdgeType };

// The key "buttonedge" (no dash) must match:
//   - useFlowState.ts: addEdge({ type: "buttonedge" })
//   - FlowEditor.tsx:  edgeTypes = { buttonedge: ButtonEdge }
export const edgeTypes = {
  buttonedge: ButtonEdge,
} satisfies EdgeTypes;

export type CustomEdgeType = BuiltInEdge | ButtonEdgeType;
