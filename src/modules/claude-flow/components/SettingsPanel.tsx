"use client";

import React, { useRef } from "react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import { Trash2, Copy, ExternalLink, Smile, RotateCcw } from "lucide-react";
import type { DiagramEdgeType } from "../types";
import { COLOR_TOKEN_ORDER, NODE_COLOR_TOKENS, EDGE_COLOR_TOKENS, type ColorToken } from "../utils/colors";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Combobox } from "@/components/ui-custom/combobox";

// ─── Sub-components ─────────────────────────────────────────────────────
// IMPORTANT: every component used below is declared at MODULE scope (outside
// SettingsPanel). Declaring components *inside* a render function gives them
// a brand-new identity on every render, which makes React unmount + remount
// their whole subtree — that was the bug behind "input loses focus after
// every keystroke" (the <input> DOM node itself got destroyed and recreated
// on each render because its wrapper, Shell/PanelHeader, was a new function
// every time). Keeping them here fixes that permanently.

/** Labeled wrapper for every settings row */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const SHELL_CLS = "flex h-full w-72 flex-col overflow-y-auto border-s border-border bg-background";

function Shell({ children }: { children: React.ReactNode }) {
  return <aside className={SHELL_CLS}>{children}</aside>;
}

const ACTION_BTN = "text-muted-foreground";
const DUPE_BTN = cn(ACTION_BTN, "hover:text-foreground");
const DEL_BTN = cn(ACTION_BTN, "hover:text-destructive");

const RESET_BTN = cn(ACTION_BTN, "hover:text-primary");

function PanelHeader({
  title,
  showDuplicate,
  onDuplicate,
  onDelete,
  onReset,
  duplicateLabel,
  deleteLabel,
  resetLabel = "Reset to default",
}: {
  title: string;
  showDuplicate: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onReset?: () => void;
  duplicateLabel: string;
  deleteLabel: string;
  resetLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="flex gap-1">
        {onReset && (
          <Button variant="ghost" size="icon-sm" onClick={onReset} className={RESET_BTN} title={resetLabel}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        {showDuplicate && (
          <Button variant="ghost" size="icon-sm" onClick={onDuplicate} className={DUPE_BTN} title={duplicateLabel}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={onDelete} className={DEL_BTN} title={deleteLabel}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Fixed 8-swatch token picker for NODE colors — each swatch shows the token's
 * background+border pre-tuned for the active light/dark colorMode. Picking one
 * sets data.colorToken and the node/edge automatically stays correct if the
 * user later flips light/dark mode.
 */
function NodeColorTokenRow({
  value,
  onChange,
  colorMode,
}: {
  value: ColorToken | undefined;
  onChange: (token: ColorToken) => void;
  colorMode: "light" | "dark";
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {COLOR_TOKEN_ORDER.map((token) => {
        const c = NODE_COLOR_TOKENS[token][colorMode];
        const active = value === token;
        return (
          <button
            key={token}
            onClick={() => onChange(token)}
            title={token}
            className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c.bg,
              borderColor: c.border,
              outline: active ? "2px solid hsl(var(--primary))" : undefined,
              outlineOffset: 1,
            }}
          />
        );
      })}
    </div>
  );
}

/** Same idea as above but for the single-hue EDGE stroke tokens. */
function EdgeColorTokenRow({
  value,
  onChange,
  colorMode,
}: {
  value: ColorToken | undefined;
  onChange: (token: ColorToken) => void;
  colorMode: "light" | "dark";
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {COLOR_TOKEN_ORDER.map((token) => {
        const c = EDGE_COLOR_TOKENS[token][colorMode];
        const active = value === token;
        return (
          <button
            key={token}
            onClick={() => onChange(token)}
            title={token}
            className="h-6 w-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 dark:border-slate-900"
            style={{
              backgroundColor: c,
              outline: active ? "2px solid hsl(var(--primary))" : undefined,
              outlineOffset: 1,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Segmented control. Active segment uses bg-background (card surface) over
 * bg-muted track, matching shadcn/ui Tabs pattern without importing it.
 * Uses an inline grid-template so it works cleanly with any option count.
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
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      className="flex w-full flex-wrap gap-1 bg-muted p-0.5"
    >
      {options.map((opt) => (
        <ToggleGroupItem key={opt.value} value={opt.value} className="h-7 flex-1 text-[11px] font-medium">
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

// A small, deliberately short set of symbols that come up constantly in
// flowchart / diagram labels (direction, status, emphasis) — click one to
// insert it at the cursor position in the label field next to it.
const LABEL_SYMBOLS = ["→", "←", "↑", "↓", "⇒", "✓", "✗", "★", "•", "⚠", "±", "≈", "∞", "…"];

/**
 * Special-symbol inserter for label fields — was previously an always-visible
 * row of ~14 buttons taking up permanent space under every label field; now
 * it's a single compact trigger button that opens the same grid inside a
 * Popover (project's own Popover component), only while actually needed.
 */
function SymbolPickerPopover({
  inputRef,
  value,
  onChange,
}: {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
}) {
  const insert = (sym: string) => {
    const el = inputRef.current;
    const current = value ?? "";
    if (!el) {
      onChange(current + sym);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + sym + current.slice(end);
    onChange(next);
    // Restore focus + caret position right after the inserted symbol — the
    // value update above happens through the store, so we wait a frame for
    // the controlled input to reflect it before moving the caret.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + sym.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Insert symbol"
          className="size-8 shrink-0 text-muted-foreground hover:text-primary"
        >
          <Smile className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="flex flex-wrap gap-1">
          {LABEL_SYMBOLS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => insert(s)}
              tabIndex={-1}
              className="flex h-7 w-7 items-center justify-center rounded border border-border text-sm leading-none text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const EDGE_TYPE_OPTIONS: { value: DiagramEdgeType; label: string }[] = [
  { value: "default", label: "Curve" },
  { value: "straight", label: "Straight" },
  { value: "step", label: "Sharp step" },
  { value: "smoothstep", label: "Smooth step" },
  { value: "floating", label: "Floating" },
  { value: "floating-straight", label: "Floating straight" },
];

/** Opens a node's link in a new tab; bare hosts get "https://" prefixed. */
function openLink(url: string | undefined) {
  if (!url?.trim()) return;
  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

// ─── SettingsPanel ────────────────────────────────────────────────────────
export function SettingsPanel() {
  // next-intl: all keys scoped under the "Flow" namespace
  const t = useTranslations("Flow");

  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const updateNodesData = useDiagramStore((s) => s.updateNodesData);
  const updateEdgeData = useDiagramStore((s) => s.updateEdgeData);
  const deleteSelected = useDiagramStore((s) => s.deleteSelected);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const resetEdgeToDefault = useDiagramStore((s) => s.resetEdgeToDefault);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);

  const nodeLabelRef = useRef<HTMLTextAreaElement>(null);
  const edgeLabelRef = useRef<HTMLInputElement>(null);

  // Multiple nodes selected at once (box/lasso/shift-click) — group style
  // editing panel takes priority over the single-node panel below. Edges are
  // never part of a multi-select (see onEdgesChange in the store).
  const multiSelectedNodes = nodes.filter((n) => n.selected);
  const isMultiSelect = multiSelectedNodes.length > 1;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // ─── Empty state ──────────────────────────────────────────────────────
  if (!isMultiSelect && !selectedNode && !selectedEdge) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center px-6 text-center text-xs text-muted-foreground">
          {t("settings.selectElement")}
        </div>
      </Shell>
    );
  }

  // ─── Multi-node settings (group style editing) ───────────────────────
  if (isMultiSelect) {
    const ids = multiSelectedNodes.map((n) => n.id);
    const first = multiSelectedNodes[0].data;
    return (
      <Shell>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {multiSelectedNodes.length} nodes selected
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => resetNodesToDefault(ids)}
              className={cn(ACTION_BTN, "hover:text-primary")}
              title="Reset all to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={deleteSelected} className={DEL_BTN} title={t("toolbar.delete")}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Field label={t("settings.backgroundColor")}>
            <NodeColorTokenRow
              value={multiSelectedNodes.every((n) => n.data.colorToken === first.colorToken) ? first.colorToken : undefined}
              onChange={(tok) => updateNodesData(ids, { colorToken: tok })}
              colorMode={colorMode}
            />
          </Field>

          <Field label={`${t("settings.fontSize")}: ${first.fontSize ?? 13}px`}>
            <Slider
              min={10}
              max={28}
              value={[first.fontSize ?? 13]}
              onValueChange={(v) => updateNodesData(ids, { fontSize: v[0] })}
              className="w-full"
            />
          </Field>

          <Field label={t("settings.fontWeight")}>
            <SegmentedControl
              value={first.fontWeight ?? "normal"}
              onChange={(v) => updateNodesData(ids, { fontWeight: v })}
              options={[
                { value: "normal", label: t("settings.weight_normal") },
                { value: "semibold", label: t("settings.weight_semibold") },
                { value: "bold", label: t("settings.weight_bold") },
              ]}
            />
          </Field>

          <Field label={`${t("settings.borderWidth")}: ${first.borderWidth ?? 1.5}px`}>
            <Slider
              min={0}
              max={6}
              step={0.5}
              value={[first.borderWidth ?? 1.5]}
              onValueChange={(v) => updateNodesData(ids, { borderWidth: v[0] })}
              className="w-full"
            />
          </Field>

          <Field label={t("settings.borderStyle")}>
            <SegmentedControl
              value={first.borderStyle ?? "solid"}
              onChange={(v) => updateNodesData(ids, { borderStyle: v })}
              options={[
                { value: "solid", label: t("settings.style_solid") },
                { value: "dashed", label: t("settings.style_dashed") },
                { value: "dotted", label: t("settings.style_dotted") },
              ]}
            />
          </Field>

          <Field label={`${t("settings.borderRadius")}: ${first.borderRadius ?? 8}px`}>
            <Slider
              min={0}
              max={32}
              value={[first.borderRadius ?? 8]}
              onValueChange={(v) => updateNodesData(ids, { borderRadius: v[0] })}
              className="w-full"
            />
          </Field>

          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Style changes above apply to all {multiSelectedNodes.length} selected nodes at once.
          </p>
        </div>
      </Shell>
    );
  }

  // ─── Node settings ────────────────────────────────────────────────────
  if (selectedNode) {
    const data = selectedNode.data;
    const isGroup = selectedNode.type === "groupNode";
    // Types rendered with their own custom UI (not ShapeCanvas/SVG) — font
    // size/weight and border width/style/radius controls don't apply to them.
    const isNonShape = [
      "groupNode",
      "numberNode",
      "operatorNode",
      "geometryCalcNode",
      "beamCalcNode",
      "shapeNode",
      "imageNode",
      "svgNode",
      "dwgNode",
      "dxfNode",
    ].includes(
      selectedNode.type ?? "",
    );
    return (
      <Shell>
        <PanelHeader
          title={isGroup ? "Sub-flow settings" : t("settings.nodeSettings")}
          showDuplicate={!isGroup}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
          onReset={() => resetNodesToDefault([selectedNode.id])}
          duplicateLabel={t("contextMenu.duplicate")}
          deleteLabel={t("toolbar.delete")}
        />
        <div className="p-4">
          <Field label={isGroup ? "Sub-flow name" : t("settings.label")}>
            <div className="flex items-start gap-1.5">
              <Textarea
                ref={nodeLabelRef}
                value={data.label}
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                rows={isGroup ? 1 : 3}
                className="min-h-16 flex-1 text-xs"
              />
              <SymbolPickerPopover
                inputRef={nodeLabelRef}
                value={data.label ?? ""}
                onChange={(v) => updateNodeData(selectedNode.id, { label: v })}
              />
            </div>
            {!isGroup && (
              <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Checkbox
                  checked={!!data.isRichText}
                  onCheckedChange={(v) => updateNodeData(selectedNode.id, { isRichText: !!v })}
                />
                Render label as HTML (rich text)
              </label>
            )}
          </Field>

          {/* Link — opens on click of the badge shown on the node, or on
              double-clicking the node itself (see components/nodes/BaseNode.tsx) */}
          {!isNonShape && (
            <Field label={t("settings.link")}>
              <div className="flex items-center gap-1.5">
                <Input
                  value={data.url ?? ""}
                  onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                  placeholder="https://..."
                  dir="ltr"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!data.url}
                  onClick={() => openLink(data.url)}
                  className="shrink-0 text-muted-foreground hover:text-primary"
                  title={t("settings.link")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Field>
          )}

          {/* Single coordinated color token — sets fill + border + text together,
              pre-tuned so it stays legible in both light and dark mode. */}
          <Field label={t("settings.backgroundColor")}>
            <NodeColorTokenRow
              value={data.colorToken}
              onChange={(tok) => updateNodeData(selectedNode.id, { colorToken: tok })}
              colorMode={colorMode}
            />
          </Field>

          {!isNonShape && (
            <>
              <Field label={`${t("settings.fontSize")}: ${data.fontSize ?? 13}px`}>
                <Slider
                  min={10}
                  max={28}
                  value={[data.fontSize ?? 13]}
                  onValueChange={(v) => updateNodeData(selectedNode.id, { fontSize: v[0] })}
                  className="w-full"
                />
              </Field>

              <Field label={t("settings.fontWeight")}>
                <SegmentedControl
                  value={data.fontWeight ?? "normal"}
                  onChange={(v) => updateNodeData(selectedNode.id, { fontWeight: v })}
                  options={[
                    { value: "normal", label: t("settings.weight_normal") },
                    { value: "semibold", label: t("settings.weight_semibold") },
                    { value: "bold", label: t("settings.weight_bold") },
                  ]}
                />
              </Field>

              <Field label={`${t("settings.borderWidth")}: ${data.borderWidth ?? 1.5}px`}>
                <Slider
                  min={0}
                  max={6}
                  step={0.5}
                  value={[data.borderWidth ?? 1.5]}
                  onValueChange={(v) => updateNodeData(selectedNode.id, { borderWidth: v[0] })}
                  className="w-full"
                />
              </Field>

              <Field label={t("settings.borderStyle")}>
                <SegmentedControl
                  value={data.borderStyle ?? "solid"}
                  onChange={(v) => updateNodeData(selectedNode.id, { borderStyle: v })}
                  options={[
                    { value: "solid", label: t("settings.style_solid") },
                    { value: "dashed", label: t("settings.style_dashed") },
                    { value: "dotted", label: t("settings.style_dotted") },
                  ]}
                />
              </Field>

              <Field label={`${t("settings.borderRadius")}: ${data.borderRadius ?? 8}px`}>
                <Slider
                  min={0}
                  max={32}
                  value={[data.borderRadius ?? 8]}
                  onValueChange={(v) => updateNodeData(selectedNode.id, { borderRadius: v[0] })}
                  className="w-full"
                />
              </Field>
            </>
          )}

          {isGroup && (
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Drag any node onto this sub-flow to group it inside. Drag it back
              out to remove it from the group. Deleting the sub-flow ungroups
              its contents instead of removing them.
            </p>
          )}
        </div>
      </Shell>
    );
  }

  // ─── Edge settings ────────────────────────────────────────────────────
  if (selectedEdge) {
    const data = selectedEdge.data ?? {};
    return (
      <Shell>
        <PanelHeader
          title={t("settings.edgeSettings")}
          showDuplicate={false}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
          onReset={() => resetEdgeToDefault(selectedEdge.id)}
          duplicateLabel={t("contextMenu.duplicate")}
          deleteLabel={t("toolbar.delete")}
        />
        <div className="p-4">
          <Field label={t("settings.label")}>
            <div className="flex items-center gap-1.5">
              <Input
                ref={edgeLabelRef}
                value={data.label ?? ""}
                onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
                placeholder="—"
                className="flex-1"
              />
              <SymbolPickerPopover
                inputRef={edgeLabelRef}
                value={data.label ?? ""}
                onChange={(v) => updateEdgeData(selectedEdge.id, { label: v })}
              />
            </div>
          </Field>

          <Field label={t("settings.edgeType")}>
            <Combobox
              options={EDGE_TYPE_OPTIONS}
              value={(data.edgeStyle ?? "smoothstep") as string}
              onChange={(v) => updateEdgeData(selectedEdge.id, { edgeStyle: v as DiagramEdgeType })}
              placeholder={t("settings.edgeType")}
            />
          </Field>

          <Field label={t("settings.edgeColor")}>
            <EdgeColorTokenRow
              value={data.colorToken}
              onChange={(tok) => updateEdgeData(selectedEdge.id, { colorToken: tok })}
              colorMode={colorMode}
            />
          </Field>

          <Field label={`${t("settings.strokeWidth")}: ${data.strokeWidth ?? 2}px`}>
            <Slider
              min={1}
              max={6}
              value={[data.strokeWidth ?? 2]}
              onValueChange={(v) => updateEdgeData(selectedEdge.id, { strokeWidth: v[0] })}
              className="w-full"
            />
          </Field>

          {/* Arrowheads — toggle start/end markers independently.
              Uses the project's existing shadcn Toggle component. */}
          <Field label="Arrowheads">
            <div className="flex gap-2">
              <Toggle
                size="sm"
                variant="outline"
                pressed={data.arrowStart ?? false}
                onPressedChange={(v) => updateEdgeData(selectedEdge.id, { arrowStart: v })}
              >
                Start
              </Toggle>
              <Toggle
                size="sm"
                variant="outline"
                pressed={data.arrowEnd ?? true}
                onPressedChange={(v) => updateEdgeData(selectedEdge.id, { arrowEnd: v })}
              >
                End
              </Toggle>
            </div>
          </Field>

          {/* Animated flow indicator — also the project's Toggle component now,
              replacing the previously custom-built sliding switch. */}
          <Field label={t("settings.animated")}>
            <Toggle
              size="sm"
              variant="outline"
              pressed={!!data.animated}
              onPressedChange={(v) => updateEdgeData(selectedEdge.id, { animated: v })}
            >
              {data.animated ? "On" : "Off"}
            </Toggle>
          </Field>
        </div>
      </Shell>
    );
  }

  return null;
}
