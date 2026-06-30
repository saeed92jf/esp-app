// src/modules/diagram-editor/components/Inspector/InspectorPanel.tsx
// Smart container that renders the correct inspector based on current selection.
// - One node selected → NodeInspector
// - One edge selected → EdgeInspector
// - Nothing / multi-select → placeholder

import React from "react";
import { useDiagramStore } from "../../store/diagramStore";
import NodeInspector from "./NodeInspector";
import EdgeInspector from "./EdgeInspector";

interface InspectorPanelProps {
  /** When true, all inputs are disabled */
  readOnly?: boolean;
}

export default function InspectorPanel({
  readOnly = false,
}: InspectorPanelProps) {
  const selection = useDiagramStore((s) => s.selection);

  // Determine what is selected
  const singleNode =
    selection.nodeIds.length === 1 && selection.edgeIds.length === 0
      ? selection.nodeIds[0]
      : null;

  const singleEdge =
    selection.edgeIds.length === 1 && selection.nodeIds.length === 0
      ? selection.edgeIds[0]
      : null;

  const multiSelect = selection.nodeIds.length + selection.edgeIds.length > 1;

  return (
    <aside
      className="h-full flex flex-col
                 border-s border-zinc-200 dark:border-zinc-800
                 bg-white dark:bg-zinc-900
                 overflow-hidden"
      aria-label="Inspector panel"
    >
      {/* ── Panel header ── */}
      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Inspector
        </h2>
      </div>

      {/* ── Panel body ── */}
      <div className="flex-1 overflow-hidden">
        {singleNode ? (
          <NodeInspector nodeId={singleNode} readOnly={readOnly} />
        ) : singleEdge ? (
          <EdgeInspector edgeId={singleEdge} readOnly={readOnly} />
        ) : multiSelect ? (
          <MultiSelectPlaceholder
            nodeCount={selection.nodeIds.length}
            edgeCount={selection.edgeIds.length}
          />
        ) : (
          <EmptyPlaceholder />
        )}
      </div>
    </aside>
  );
}

// ── Local placeholder components ─────────────────────────────────────────────

function EmptyPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
      {/* Simple SVG icon representing a cursor/selection */}
      <svg
        className="w-8 h-8 text-zinc-300 dark:text-zinc-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47
             5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25
             10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
        />
      </svg>
      <p className="text-xs text-zinc-400 leading-relaxed">
        Select a node or edge
        <br />
        to edit its properties
      </p>
    </div>
  );
}

function MultiSelectPlaceholder({
  nodeCount,
  edgeCount,
}: {
  nodeCount: number;
  edgeCount: number;
}) {
  const parts: string[] = [];
  if (nodeCount > 0) parts.push(`${nodeCount} node${nodeCount > 1 ? "s" : ""}`);
  if (edgeCount > 0) parts.push(`${edgeCount} edge${edgeCount > 1 ? "s" : ""}`);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
      <svg
        className="w-8 h-8 text-zinc-300 dark:text-zinc-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504
             1.125 1.125v3.75c0 .621-.504 1.125-1.125
             1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25
             8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504
             1.125 1.125v8.25c0 .621-.504 1.125-1.125
             1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75
             16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504
             1.125 1.125v2.25c0 .621-.504 1.125-1.125
             1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
        />
      </svg>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {parts.join(" & ")} selected
        <br />
        <span className="text-zinc-300 dark:text-zinc-600">
          Select one item to edit
        </span>
      </p>
    </div>
  );
}
