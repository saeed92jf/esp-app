"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import { Trash2, Copy } from "lucide-react";
import type { DiagramEdgeType } from "../types";
import { cn } from "@/lib/utils";

// ── Color palette swatches ────────────────────────────────────────────────────
// These are node fill / background colors shown in the color picker rows
const COLOR_SWATCHES = [
  "#ffffff",
  "#f1f5f9",
  "#fee2e2",
  "#fef9c3",
  "#dcfce7",
  "#dbeafe",
  "#ede9fe",
  "#fce7f3",
];

// Stroke / border color swatches shared between node border and edge color pickers
const BORDER_SWATCHES = [
  "#cbd5e1",
  "#ef4444",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#0f172a",
];

// ── Sub-components ────────────────────────────────────────────────────────────

/** Labeled wrapper for every settings row */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Row of color swatches + native color picker fallback */
function ColorRow({
  value,
  onChange,
  swatches,
}: {
  value: string;
  onChange: (v: string) => void;
  swatches: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {swatches.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="h-5 w-5 rounded-full border border-border transition-transform hover:scale-110"
          style={{
            backgroundColor: c,
            // Selected swatch gets a primary-colored ring
            outline: value === c ? "2px solid hsl(var(--primary))" : undefined,
            outlineOffset: 1,
          }}
        />
      ))}
      {/* Native color picker for custom colors beyond the swatches */}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-5 w-7 cursor-pointer rounded border border-border bg-transparent p-0"
      />
    </div>
  );
}

/**
 * 3-option segmented control.
 * Active segment uses bg-background (card surface) over bg-muted track,
 * matching shadcn/ui Tabs pattern without importing the full component.
 */
function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded px-2 py-1 text-[11px] font-medium transition-colors",
            opt.value === value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Shared header action button styles ────────────────────────────────────────
const ACTION_BTN = "rounded p-1 transition-colors text-muted-foreground";
const DUPE_BTN = cn(ACTION_BTN, "hover:bg-accent hover:text-foreground");
const DEL_BTN = cn(
  ACTION_BTN,
  "hover:bg-destructive/10 hover:text-destructive",
);

// ── Shared input style ────────────────────────────────────────────────────────
const INPUT_CLS = cn(
  "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs",
  "text-foreground placeholder:text-muted-foreground",
  "outline-none focus:border-primary focus:ring-1 focus:ring-primary",
);

// ── SettingsPanel ─────────────────────────────────────────────────────────────
export function SettingsPanel() {
  // next-intl: all keys scoped under the "Flow" namespace
  const t = useTranslations("Flow");

  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const updateEdgeData = useDiagramStore((s) => s.updateEdgeData);
  const deleteSelected = useDiagramStore((s) => s.deleteSelected);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // ── Shared aside wrapper ───────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <aside className="flex h-full w-72 flex-col overflow-y-auto border-s border-border bg-background">
      {children}
    </aside>
  );

  // ── Shared panel header ────────────────────────────────────────────────────
  const PanelHeader = ({
    title,
    showDuplicate = false,
  }: {
    title: string;
    showDuplicate?: boolean;
  }) => (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex gap-1">
        {showDuplicate && (
          <button
            onClick={duplicateSelected}
            className={DUPE_BTN}
            title={t("contextMenu.duplicate")}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={deleteSelected}
          className={DEL_BTN}
          title={t("toolbar.delete")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!selectedNode && !selectedEdge) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center px-6 text-center text-xs text-muted-foreground">
          {t("settings.selectElement")}
        </div>
      </Shell>
    );
  }

  // ── Node settings ──────────────────────────────────────────────────────────
  if (selectedNode) {
    const data = selectedNode.data;
    return (
      <Shell>
        <PanelHeader title={t("settings.nodeSettings")} showDuplicate />
        <div className="p-4">
          <Field label={t("settings.label")}>
            <input
              value={data.label}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { label: e.target.value })
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label={t("settings.backgroundColor")}>
            <ColorRow
              value={data.backgroundColor ?? "#ffffff"}
              onChange={(v) =>
                updateNodeData(selectedNode.id, { backgroundColor: v })
              }
              swatches={COLOR_SWATCHES}
            />
          </Field>

          <Field label={t("settings.borderColor")}>
            <ColorRow
              value={data.borderColor ?? "#cbd5e1"}
              onChange={(v) =>
                updateNodeData(selectedNode.id, { borderColor: v })
              }
              swatches={BORDER_SWATCHES}
            />
          </Field>

          <Field label={t("settings.textColor")}>
            <ColorRow
              value={data.textColor ?? "#0f172a"}
              onChange={(v) =>
                updateNodeData(selectedNode.id, { textColor: v })
              }
              swatches={[
                "#0f172a",
                "#475569",
                "#ffffff",
                "#ef4444",
                "#3b82f6",
                "#22c55e",
              ]}
            />
          </Field>

          {/* Font size: current value interpolated inline; t() used only for the label key */}
          <Field label={`${t("settings.fontSize")}: ${data.fontSize ?? 13}px`}>
            <input
              type="range"
              min={10}
              max={28}
              value={data.fontSize ?? 13}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  fontSize: Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
          </Field>

          <Field label={t("settings.fontWeight")}>
            <SegmentedControl
              value={data.fontWeight ?? "normal"}
              onChange={(v) =>
                updateNodeData(selectedNode.id, { fontWeight: v })
              }
              options={[
                { value: "normal", label: t("settings.weight_normal") },
                { value: "semibold", label: t("settings.weight_semibold") },
                { value: "bold", label: t("settings.weight_bold") },
              ]}
            />
          </Field>

          <Field
            label={`${t("settings.borderWidth")}: ${data.borderWidth ?? 1.5}px`}
          >
            <input
              type="range"
              min={0}
              max={6}
              step={0.5}
              value={data.borderWidth ?? 1.5}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  borderWidth: Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
          </Field>

          <Field label={t("settings.borderStyle")}>
            <SegmentedControl
              value={data.borderStyle ?? "solid"}
              onChange={(v) =>
                updateNodeData(selectedNode.id, { borderStyle: v })
              }
              options={[
                { value: "solid", label: t("settings.style_solid") },
                { value: "dashed", label: t("settings.style_dashed") },
                { value: "dotted", label: t("settings.style_dotted") },
              ]}
            />
          </Field>

          <Field
            label={`${t("settings.borderRadius")}: ${data.borderRadius ?? 8}px`}
          >
            <input
              type="range"
              min={0}
              max={32}
              value={data.borderRadius ?? 8}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  borderRadius: Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
          </Field>
        </div>
      </Shell>
    );
  }

  // ── Edge settings ──────────────────────────────────────────────────────────
  if (selectedEdge) {
    const data = selectedEdge.data ?? {};
    return (
      <Shell>
        <PanelHeader title={t("settings.edgeSettings")} />
        <div className="p-4">
          <Field label={t("settings.label")}>
            <input
              value={data.label ?? ""}
              onChange={(e) =>
                updateEdgeData(selectedEdge.id, { label: e.target.value })
              }
              placeholder="—"
              className={INPUT_CLS}
            />
          </Field>

          <Field label={t("settings.edgeType")}>
            <SegmentedControl
              value={(data.edgeStyle ?? "smoothstep") as DiagramEdgeType}
              onChange={(v) =>
                updateEdgeData(selectedEdge.id, { edgeStyle: v })
              }
              options={[
                { value: "default", label: "Curve" },
                { value: "straight", label: "Line" },
                { value: "smoothstep", label: "Step" },
              ]}
            />
          </Field>

          <Field label={t("settings.edgeColor")}>
            <ColorRow
              value={data.color ?? "#94a3b8"}
              onChange={(v) => updateEdgeData(selectedEdge.id, { color: v })}
              swatches={BORDER_SWATCHES}
            />
          </Field>

          <Field
            label={`${t("settings.strokeWidth")}: ${data.strokeWidth ?? 2}px`}
          >
            <input
              type="range"
              min={1}
              max={6}
              value={data.strokeWidth ?? 2}
              onChange={(e) =>
                updateEdgeData(selectedEdge.id, {
                  strokeWidth: Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
          </Field>

          {/* Toggle switch for edge animation — uses primary/muted tokens */}
          <Field label={t("settings.animated")}>
            <button
              onClick={() =>
                updateEdgeData(selectedEdge.id, { animated: !data.animated })
              }
              role="switch"
              aria-checked={!!data.animated}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                data.animated ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-xs transition-transform",
                  // RTL-aware: use positive translate for LTR, negative for RTL
                  data.animated
                    ? "translate-x-4 rtl:-translate-x-4"
                    : "translate-x-0.5",
                )}
              />
            </button>
          </Field>
        </div>
      </Shell>
    );
  }

  return null;
}
