// src/modules/claude-flow/utils/layout.ts
// ─────────────────────────────────────────────────────────────────────────
// Auto-layout for the "Layout" toolbar menu. Two engines, matching the
// official examples:
//   https://reactflow.dev/examples/layout/dagre
//   https://reactflow.dev/examples/layout/elkjs
//   https://reactflow.dev/examples/layout/horizontal   (direction: LR)
//
// NOTE ON DEPENDENCIES: this file imports `dagre` and, lazily, `elkjs`.
// Neither ships with this module — add them to package.json:
//   npm install dagre elkjs
//   npm install -D @types/dagre
//
// v1 scope: only top-level nodes (no parentId) are repositioned. Nodes
// inside a sub-flow/group keep their position relative to their group —
// laying out inside a group is a reasonable v2 addition but out of scope
// here since group sizes would also need to be recomputed.
// ─────────────────────────────────────────────────────────────────────────

import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import type { DiagramNodeData, DiagramEdgeData, DiagramNodeType } from "../types";
import { SHAPE_DEFAULT_SIZE } from "./shapes";

export type LayoutDirection = "TB" | "LR";

function dims(n: Node<DiagramNodeData>) {
  const fallback = SHAPE_DEFAULT_SIZE[(n.type ?? "defaultNode") as DiagramNodeType] ?? SHAPE_DEFAULT_SIZE.defaultNode;
  return { width: n.data?.width ?? fallback.width, height: n.data?.height ?? fallback.height };
}

/** Synchronous Dagre layered layout — fast, good default.
 *  `restrictToIds`: when given a non-empty set, only lays out THOSE nodes
 *  (e.g. the current selection) — everything else keeps its exact position.
 *  Leave empty/undefined to lay out every top-level node, same as before. */
export function layoutWithDagre(
  nodes: Node<DiagramNodeData>[],
  edges: Edge<DiagramEdgeData>[],
  direction: LayoutDirection = "TB",
  restrictToIds?: Set<string>,
): Node<DiagramNodeData>[] {
  const restricted = !!restrictToIds && restrictToIds.size > 0;
  const topLevel = nodes.filter((n) => !n.parentId && (!restricted || restrictToIds!.has(n.id)));
  const topLevelIds = new Set(topLevel.map((n) => n.id));

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 90, marginx: 40, marginy: 40 });

  topLevel.forEach((n) => {
    const { width, height } = dims(n);
    g.setNode(n.id, { width, height });
  });

  edges.forEach((e) => {
    if (topLevelIds.has(e.source) && topLevelIds.has(e.target)) {
      g.setEdge(e.source, e.target);
    }
  });

  dagre.layout(g);

  const positioned = new Map(
    topLevel.map((n) => {
      const { width, height } = dims(n);
      const gNode = g.node(n.id);
      // dagre positions nodes by CENTER — React Flow positions by top-left.
      return [n.id, { x: gNode.x - width / 2, y: gNode.y - height / 2 }] as const;
    }),
  );

  return nodes.map((n) => (positioned.has(n.id) ? { ...n, position: positioned.get(n.id)! } : n));
}

/** Async ELK layered layout — a second engine option with different aesthetics/tuning.
 *  Same `restrictToIds` behavior as layoutWithDagre. */
export async function layoutWithElk(
  nodes: Node<DiagramNodeData>[],
  edges: Edge<DiagramEdgeData>[],
  direction: LayoutDirection = "TB",
  restrictToIds?: Set<string>,
): Promise<Node<DiagramNodeData>[]> {
  const { default: ELK } = await import("elkjs/lib/elk.bundled.js");
  const elk = new ELK();

  const restricted = !!restrictToIds && restrictToIds.size > 0;
  const topLevel = nodes.filter((n) => !n.parentId && (!restricted || restrictToIds!.has(n.id)));
  const topLevelIds = new Set(topLevel.map((n) => n.id));

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction === "LR" ? "RIGHT" : "DOWN",
      "elk.spacing.nodeNode": "60",
      "elk.layered.spacing.nodeNodeBetweenLayers": "90",
    },
    children: topLevel.map((n) => {
      const { width, height } = dims(n);
      return { id: n.id, width, height };
    }),
    edges: edges
      .filter((e) => topLevelIds.has(e.source) && topLevelIds.has(e.target))
      .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  };

  const result = await elk.layout(elkGraph);
  const positioned = new Map(
    (result.children ?? []).map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }] as const),
  );

  return nodes.map((n) => (positioned.has(n.id) ? { ...n, position: positioned.get(n.id)! } : n));
}
