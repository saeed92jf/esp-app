// src/modules/diagram-editor/components/StatusBar/StatusBar.tsx
// Bottom status bar showing node/edge counts, zoom level, and editor mode.

"use client";

import React from "react";
import { useDiagramStore } from "../../store/diagramStore";

const MODE_LABELS: Record<string, string> = {
  select: "انتخاب",
  pan: "جابجایی",
  connect: "اتصال",
};

export const StatusBar: React.FC = () => {
  const { nodes, edges, viewport, editorMode, selectedNodeId, selectedEdgeId } =
    useDiagramStore();

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <div
      className="flex items-center justify-between px-3 py-1
                 bg-muted/50 border-t border-border text-xs text-muted-foreground
                 select-none"
      role="status"
      aria-live="polite"
      aria-label="نوار وضعیت"
    >
      {/* Left: selection info */}
      <div className="flex items-center gap-3">
        {selectedNodeId && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-primary/60" />
            گره انتخاب‌شده:{" "}
            <span className="font-mono">{selectedNodeId.slice(0, 8)}</span>
          </span>
        )}
        {selectedEdgeId && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary/60" />
            یال انتخاب‌شده:{" "}
            <span className="font-mono">{selectedEdgeId.slice(0, 8)}</span>
          </span>
        )}
        {!selectedNodeId && !selectedEdgeId && (
          <span>هیچ موردی انتخاب نشده</span>
        )}
      </div>

      {/* Center: node/edge counts */}
      <div className="flex items-center gap-3">
        <span>گره‌ها: {nodes.length}</span>
        <span>·</span>
        <span>یال‌ها: {edges.length}</span>
      </div>

      {/* Right: zoom and mode */}
      <div className="flex items-center gap-3">
        <span>بزرگ‌نمایی: {zoomPercent}٪</span>
        <span>·</span>
        <span>حالت: {MODE_LABELS[editorMode] ?? editorMode}</span>
      </div>
    </div>
  );
};
