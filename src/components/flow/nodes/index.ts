// src/components/flow/nodes/index.ts
// Registers all custom node types for React Flow.
// Initial diagram data lives in @/data/equipmentDiagramBuilder – not here.
import type { NodeTypes } from "@xyflow/react";

import HubNode from "./HubNode";
import CategoryNode from "./CategoryNode";
import SubcategoryNode from "./SubcategoryNode";
import StandardNode from "./StandardNode";
import PositionLoggerNode from "./PositionLoggerNode";

export { HubNode, CategoryNode, SubcategoryNode, StandardNode };

export const nodeTypes = {
  hub: HubNode,
  category: CategoryNode,
  subcategory: SubcategoryNode,
  standard: StandardNode,
  // Dev helper – remove before production if not needed
  "position-logger": PositionLoggerNode,
} satisfies NodeTypes;
