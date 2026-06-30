// src/modules/diagram-editor/components/Inspector/NodeInspector.tsx
// Full property inspector for a single selected node.
// Sections: Info, Shape, Style (colors / border / font / opacity / shadow), Animation.

import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useDiagramStore } from "../../store/diagramStore";
import { COLOR_PRESETS, AVAILABLE_SHAPES } from "../../constants/defaults";
import { getShapeDisplayName } from "../../utils/nodeShapes";
import type {
  DiagramNodeData,
  NodeShape,
  NodeAnimation,
} from "../../types/diagram.types";

interface NodeInspectorProps {
  nodeId: string;
  readOnly?: boolean;
}

export default function NodeInspector({
  nodeId,
  readOnly = false,
}: NodeInspectorProps) {
  const nodes = useDiagramStore((s) => s.nodes);
  const updateNode = useDiagramStore((s) => s.updateNodeData);

  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const data = node.data as DiagramNodeData;

  // Patch top-level DiagramNodeData fields
  const set = useCallback(
    (patch: Partial<DiagramNodeData>) => updateNode(nodeId, patch),
    [nodeId, updateNode],
  );

  // Patch nested style fields while preserving existing values
  const setStyle = useCallback(
    (patch: Partial<DiagramNodeData["style"]>) =>
      updateNode(nodeId, { style: { ...data.style, ...patch } }),
    [nodeId, updateNode, data.style],
  );

  return (
    <div className="flex flex-col gap-4 p-3 text-sm overflow-y-auto h-full">
      {/* ── Info ───────────────────────────────────────────── */}
      <Section title="Info">
        <Field label="Label">
          <Input
            value={data.label}
            disabled={readOnly}
            onChange={(e) => set({ label: e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field label="Description">
          <Input
            value={data.description ?? ""}
            placeholder="optional"
            disabled={readOnly}
            onChange={(e) => set({ description: e.target.value || undefined })}
            className="h-7 text-xs"
          />
        </Field>
        <Field label="Locked">
          <Switch
            checked={!!data.locked}
            disabled={readOnly}
            onCheckedChange={(v) => set({ locked: v })}
            aria-label="Lock node position"
          />
        </Field>
      </Section>

      <Separator />

      {/* ── Shape ──────────────────────────────────────────── */}
      <Section title="Shape">
        <Field label="Type">
          <Select
            value={data.shape}
            disabled={readOnly}
            onValueChange={(v) => set({ shape: v as NodeShape })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_SHAPES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {getShapeDisplayName(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Separator />

      {/* ── Style ──────────────────────────────────────────── */}
      <Section title="Style">
        <Field label="Background">
          <ColorPicker
            value={data.style.backgroundColor}
            disabled={readOnly}
            onChange={(v) => setStyle({ backgroundColor: v })}
          />
        </Field>

        <Field label="Border Color">
          <ColorPicker
            value={data.style.borderColor}
            disabled={readOnly}
            onChange={(v) => setStyle({ borderColor: v })}
          />
        </Field>

        <Field label="Text Color">
          <ColorPicker
            value={data.style.textColor}
            disabled={readOnly}
            onChange={(v) => setStyle({ textColor: v })}
          />
        </Field>

        <Field label={`Border: ${data.style.borderWidth}px`}>
          <Slider
            min={0}
            max={8}
            step={1}
            value={[data.style.borderWidth]}
            disabled={readOnly}
            onValueChange={([v]) => setStyle({ borderWidth: v })}
            className="h-4"
          />
        </Field>

        <Field label={`Font: ${data.style.fontSize}px`}>
          <Slider
            min={10}
            max={32}
            step={1}
            value={[data.style.fontSize]}
            disabled={readOnly}
            onValueChange={([v]) => setStyle({ fontSize: v })}
            className="h-4"
          />
        </Field>

        <Field label={`Opacity: ${Math.round(data.style.opacity * 100)}%`}>
          <Slider
            min={0.1}
            max={1}
            step={0.05}
            value={[data.style.opacity]}
            disabled={readOnly}
            onValueChange={([v]) => setStyle({ opacity: v })}
            className="h-4"
          />
        </Field>

        <Field label="Font Weight">
          <Select
            value={data.style.fontWeight}
            disabled={readOnly}
            onValueChange={(v) =>
              setStyle({
                fontWeight: v as DiagramNodeData["style"]["fontWeight"],
              })
            }
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["normal", "medium", "semibold", "bold"] as const).map((w) => (
                <SelectItem key={w} value={w} className="text-xs capitalize">
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Shadow">
          <Select
            value={data.style.shadow}
            disabled={readOnly}
            onValueChange={(v) =>
              setStyle({ shadow: v as DiagramNodeData["style"]["shadow"] })
            }
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["none", "sm", "md", "lg", "xl"] as const).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s === "none" ? "None" : `Shadow ${s}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Separator />

      {/* ── Animation ──────────────────────────────────────── */}
      <Section title="Animation">
        <Field label="Effect">
          <Select
            value={data.style.animation ?? "none"}
            disabled={readOnly}
            onValueChange={(v) => setStyle({ animation: v as NodeAnimation })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["none", "pulse", "bounce", "spin", "ping"] as const).map(
                (a) => (
                  <SelectItem key={a} value={a} className="text-xs capitalize">
                    {a}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </Field>
      </Section>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs text-zinc-500 shrink-0 w-24 leading-tight">
        {label}
      </Label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// Native color input + hex text input + preset swatches
function ColorPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {/* Color wheel + hex input */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 rounded border border-zinc-200 dark:border-zinc-700
                     cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 p-0.5"
          aria-label="Color picker"
        />
        <Input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs font-mono flex-1"
          maxLength={9}
          spellCheck={false}
        />
      </div>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-1">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onChange(c)}
            className="w-4 h-4 rounded-sm border border-zinc-200 dark:border-zinc-700
                       hover:scale-125 transition-transform
                       disabled:cursor-not-allowed disabled:opacity-40
                       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            style={{ backgroundColor: c }}
            aria-label={`Use color ${c}`}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
