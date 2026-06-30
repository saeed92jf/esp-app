// src/modules/diagram-editor/components/Inspector/EdgeInspector.tsx
// Full property inspector for a single selected edge.
// Sections: Info (label, animated), Stroke (color, width, line style), Arrows.

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
import { COLOR_PRESETS } from "../../constants/defaults";
import type {
  DiagramEdgeData,
  EdgeLineStyle,
  EdgeArrowType,
} from "../../types/diagram.types";

interface EdgeInspectorProps {
  edgeId: string;
  readOnly?: boolean;
}

export default function EdgeInspector({
  edgeId,
  readOnly = false,
}: EdgeInspectorProps) {
  const edges = useDiagramStore((s) => s.edges);
  const updateEdge = useDiagramStore((s) => s.updateEdgeData);

  const edge = edges.find((e) => e.id === edgeId);
  if (!edge) return null;

  // Edge data may be undefined for newly created edges — provide safe defaults
  const data: DiagramEdgeData = {
    label: "",
    animated: false,
    strokeColor: "#6366f1",
    strokeWidth: 2,
    lineStyle: "solid",
    arrowStart: "none",
    arrowEnd: "arrowclosed",
    ...edge.data,
  };

  const set = useCallback(
    (patch: Partial<DiagramEdgeData>) => updateEdge(edgeId, patch),
    [edgeId, updateEdge],
  );

  return (
    <div className="flex flex-col gap-4 p-3 text-sm overflow-y-auto h-full">
      {/* ── Info ───────────────────────────────────────────── */}
      <Section title="Info">
        <Field label="Label">
          <Input
            value={data.label ?? ""}
            placeholder="optional"
            disabled={readOnly}
            onChange={(e) => set({ label: e.target.value || undefined })}
            className="h-7 text-xs"
          />
        </Field>
        <Field label="Animated">
          <Switch
            checked={!!data.animated}
            disabled={readOnly}
            onCheckedChange={(v) => set({ animated: v })}
            aria-label="Animate edge flow"
          />
        </Field>
      </Section>

      <Separator />

      {/* ── Stroke ─────────────────────────────────────────── */}
      <Section title="Stroke">
        <Field label="Color">
          <ColorPicker
            value={data.strokeColor}
            disabled={readOnly}
            onChange={(v) => set({ strokeColor: v })}
          />
        </Field>

        <Field label={`Width: ${data.strokeWidth}px`}>
          <Slider
            min={1}
            max={8}
            step={1}
            value={[data.strokeWidth]}
            disabled={readOnly}
            onValueChange={([v]) => set({ strokeWidth: v })}
            className="h-4"
          />
        </Field>

        <Field label="Line Style">
          <Select
            value={data.lineStyle}
            disabled={readOnly}
            onValueChange={(v) => set({ lineStyle: v as EdgeLineStyle })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["solid", "dashed", "dotted"] as const).map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Separator />

      {/* ── Arrows ─────────────────────────────────────────── */}
      <Section title="Arrows">
        <Field label="Start">
          <Select
            value={data.arrowStart}
            disabled={readOnly}
            onValueChange={(v) => set({ arrowStart: v as EdgeArrowType })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["none", "arrow", "arrowclosed"] as const).map((a) => (
                <SelectItem key={a} value={a} className="text-xs">
                  {ARROW_LABELS[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="End">
          <Select
            value={data.arrowEnd}
            disabled={readOnly}
            onValueChange={(v) => set({ arrowEnd: v as EdgeArrowType })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["none", "arrow", "arrowclosed"] as const).map((a) => (
                <SelectItem key={a} value={a} className="text-xs">
                  {ARROW_LABELS[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>
    </div>
  );
}

// Human-readable labels for arrow type values
const ARROW_LABELS: Record<EdgeArrowType, string> = {
  none: "None  ─",
  arrow: "Open  ➜",
  arrowclosed: "Filled ▶",
};

// ── Shared sub-components (same pattern as NodeInspector) ─────────────────────

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
