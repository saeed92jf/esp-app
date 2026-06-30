// src/components/flow/NodeEditPanel.tsx
// Side panel for editing selected node properties.
"use client";

import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { ExternalLink, X } from "lucide-react";
import type { StandardNodeData, StandardType } from "@/components/flow/nodes";

const ALL_STANDARD_TYPES: StandardType[] = [
  "API",
  "ASME",
  "ASTM",
  "NACE",
  "NBIC",
  "TEMA",
  "AHRI",
  "MSS",
  "STI",
  "ANSI",
  "PFI",
  "OTHER",
];

interface NodeEditPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<Node["data"]>) => void;
}

// ─── Shared field style ───────────────────────────────────────────────────────
const fieldCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm " +
  "text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function NodeEditPanel({ node, onClose, onUpdate }: NodeEditPanelProps) {
  // ── Hooks MUST come before any early return ────────────────────────────────
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!node) return;
      onUpdate(node.id, { label: e.target.value });
    },
    [node, onUpdate],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!node) return;
      onUpdate(node.id, { description: e.target.value });
    },
    [node, onUpdate],
  );

  const handleStandardTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!node) return;
      onUpdate(node.id, { standardType: e.target.value as StandardType });
    },
    [node, onUpdate],
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!node) return;
      onUpdate(node.id, { url: e.target.value });
    },
    [node, onUpdate],
  );

  const handleFullNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!node) return;
      onUpdate(node.id, { fullName: e.target.value });
    },
    [node, onUpdate],
  );

  // ── Early return AFTER all hooks ───────────────────────────────────────────
  if (!node) return null;

  const data = node.data as Record<string, unknown>;
  const isStd = node.type === "standard";
  const stdData = isStd ? (data as unknown as StandardNodeData) : null;

  return (
    <div className="absolute right-4 top-4 z-10 w-80 rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xl overflow-y-auto max-h-[calc(100%-2rem)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-lg font-semibold">Edit Node</h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Close"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Type badge */}
      <div className="mb-4">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
          {node.type ?? "unknown"}
        </span>
      </div>

      {/* Label */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Label</label>
        <input
          type="text"
          value={(data.label as string) ?? ""}
          onChange={handleLabelChange}
          className={fieldCls}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          value={(data.description as string) ?? ""}
          onChange={handleDescriptionChange}
          rows={3}
          className={fieldCls}
        />
      </div>

      {/* Standard-specific fields */}
      {isStd && stdData && (
        <>
          {/* Standard Type */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Standard Type
            </label>
            <select
              value={stdData.standardType ?? "OTHER"}
              onChange={handleStandardTypeChange}
              className={fieldCls}
            >
              {ALL_STANDARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={(stdData.fullName as string) ?? ""}
              onChange={handleFullNameChange}
              placeholder="e.g. API 510 – Pressure Vessel Inspection"
              className={fieldCls}
            />
          </div>

          {/* URL */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Reference URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={(stdData.url as string) ?? ""}
                onChange={handleUrlChange}
                placeholder="https://..."
                className={`${fieldCls} flex-1`}
              />
              {stdData.url && (
                <a
                  href={stdData.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* Node ID (read-only) */}
      <div className="mt-4 rounded-md bg-muted p-2">
        <p className="text-xs text-muted-foreground">
          ID: <code className="font-mono">{node.id}</code>
        </p>
      </div>
    </div>
  );
}
