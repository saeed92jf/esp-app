import type { EdgeTypes } from "@xyflow/react";
import BaseEdge from "./BaseEdge";
// Registry mapping edge type names to the BaseEdge renderer.
export const edgeTypes: EdgeTypes = {
  custom:  BaseEdge,
  default: BaseEdge,
  smooth:  BaseEdge,
};
