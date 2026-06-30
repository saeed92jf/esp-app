import type { NodeTypes } from "@xyflow/react";
import BaseNode from "./BaseNode";
// Registry mapping every NodeShape type name to the BaseNode renderer.
// React Flow uses this map to look up which component to render per node type.
export const nodeTypes: NodeTypes = {
  rectangle:    BaseNode,
  rounded:      BaseNode,
  circle:       BaseNode,
  diamond:      BaseNode,
  parallelogram: BaseNode,
  hexagon:      BaseNode,
  cylinder:     BaseNode,
  custom:       BaseNode,
  // Fallback for nodes without an explicit type
  default:      BaseNode,
};
