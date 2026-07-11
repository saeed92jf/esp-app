// src/modules/claude-flow/utils/validation.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Connection rules used by <ReactFlow isValidConnection={...}>.
// https://reactflow.dev/examples/interaction/validation
//
// Per-handle connection-count limits were removed entirely â€” for ordinary
// diagram nodes there's no logical reason to cap how many edges a handle can
// carry, and it was actively getting in the way of legitimate patterns like
// an operatorNode (or any calculator node) accepting many inputs on one
// handle. The only two rules that still make universal sense are kept:
// no self-loops, and no exact duplicate edges.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import type { Connection, Edge, Node } from "@xyflow/react";

export function makeIsValidConnection(getState: () => { nodes: Node[]; edges: Edge[] }) {
  return (connection: Connection | Edge): boolean => {
    const { source, target, sourceHandle, targetHandle } = connection as Connection;
    if (!source || !target) return false;

    // Rule 1 â€” no self-loops (a node connecting to itself).
    if (source === target) return false;

    // Rule 2 â€” no exact duplicate edges (same source+target+handles already connected).
    const { edges } = getState();
    const isDuplicate = edges.some(
      (e) =>
        e.source === source &&
        e.target === target &&
        (e.sourceHandle ?? null) === (sourceHandle ?? null) &&
        (e.targetHandle ?? null) === (targetHandle ?? null),
    );
    if (isDuplicate) return false;

    return true;
  };
}


