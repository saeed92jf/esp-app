// NodeEditPanel.tsx - Side panel for editing selected node properties
"use client";

import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { X } from "lucide-react";

interface NodeEditPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<Node["data"]>) => void;
}

export function NodeEditPanel({ node, onClose, onUpdate }: NodeEditPanelProps) {
  if (!node) return null;

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(node.id, { label: e.target.value });
    },
    [node.id, onUpdate],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate(node.id, { description: e.target.value });
    },
    [node.id, onUpdate],
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate(node.id, { type: e.target.value });
    },
    [node.id, onUpdate],
  );

  return (
    <div className="absolute right-4 top-4 z-10 w-80 rounded-lg border border-warm-border bg-surface-primary p-4 shadow-xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-warm-border pb-3">
        <h3 className="text-lg font-semibold text-ink">Edit Node</h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-text transition-colors hover:bg-warm-border hover:text-ink"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Node Type Badge */}
      <div className="mb-4">
        <span className="inline-block rounded-full bg-accent-tint px-3 py-1 text-xs font-medium text-accent">
          {node.type?.toUpperCase() || "UNKNOWN"}
        </span>
      </div>

      {/* Label Input */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-ink">Label</label>
        <input
          type="text"
          onChange={handleLabelChange}
          className="w-full rounded-md border border-warm-border bg-surface-secondary px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Description Input (if applicable) */}
      {node.data.description !== undefined && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-ink">
            Description
          </label>
          <textarea
            onChange={handleDescriptionChange}
            rows={3}
            className="w-full rounded-md border border-warm-border bg-surface-secondary px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      )}

      {/* Standard Type Selector (for standard nodes) */}
      {node.type === "standard" && node.data.type !== undefined && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-ink">
            Standard Type
          </label>
          <select
            onChange={handleTypeChange}
            className="w-full rounded-md border border-warm-border bg-surface-secondary px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="API">API</option>
            <option value="ASME">ASME</option>
            <option value="ASTM">ASTM</option>
            <option value="NACE">NACE</option>
            <option value="NBIC">NBIC</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      )}

      {/* Node ID (read-only) */}
      <div className="mt-4 rounded-md bg-accent-tint p-2">
        <p className="text-xs text-muted-text">
          ID: <code className="font-mono">{node.id}</code>
        </p>
      </div>
    </div>
  );
}
