// src/data/initialElements.ts

import type { Node, Edge } from "@xyflow/react";
import type { PositionLoggerNode } from "@/components/flow/nodes/PositionLoggerNode";
import type { ButtonEdge } from "@/components/flow/edges/ButtonEdge";

// Define initial nodes with proper positioning
export const initialNodes: Node[] = [
  {
    id: "1",
    type: "position-logger",
    position: { x: 100, y: 100 },
    data: { label: "Node 1" },
  },
  {
    id: "2",
    type: "position-logger",
    position: { x: 400, y: 100 },
    data: { label: "Node 2" },
  },
  {
    id: "3",
    type: "position-logger",
    position: { x: 250, y: 300 },
    data: { label: "Node 3" },
  },
] satisfies PositionLoggerNode[];

// Define initial edges connecting the nodes
export const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "button-edge",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "button-edge",
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "button-edge",
  },
] satisfies ButtonEdge[];
