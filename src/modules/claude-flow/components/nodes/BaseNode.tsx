"use client";

import React from "react";
import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import type { DiagramNodeData, DiagramNodeType } from "../../types";

// ─── Font weight lookup ────────────────────────────────────────────────────────

const FONT_WEIGHT_MAP: Record<string, number> = {
  normal: 400,
  semibold: 600,
  bold: 700,
};

// ─── Typed node alias ─────────────────────────────────────────────────────────
// ReactFlow v12+ requires Node<TData, TType> — not just the data shape.
// All wrapper components receive this full node object via NodeProps.

type DiagramNodeObject = Node<DiagramNodeData, DiagramNodeType>;

// NodeProps from @xyflow/react v12 is NodeProps<TNode extends Node> —
// so we pass the full node type, not just the data type.
type DiagramNodeProps = NodeProps<DiagramNodeObject>;

// ─── Style helper ─────────────────────────────────────────────────────────────

export function getNodeStyle(data: DiagramNodeData): React.CSSProperties {
  return {
    backgroundColor: data.backgroundColor ?? "#ffffff",
    borderColor: data.borderColor ?? "#cbd5e1",
    color: data.textColor ?? "#0f172a",
    fontSize: data.fontSize ?? 13,
    fontWeight: FONT_WEIGHT_MAP[data.fontWeight ?? "normal"] ?? 400,
    borderWidth: data.borderWidth ?? 1.5,
    borderStyle: data.borderStyle ?? "solid",
    borderRadius: data.borderRadius ?? 8,
  };
}

// ─── BaseNodeShell ─────────────────────────────────────────────────────────────
// Internal shell — never registered directly as a nodeType.
// Wrapper components call this with data.label as children.

interface BaseNodeShellProps {
  selected?: boolean;
  data: DiagramNodeData;
  children: React.ReactNode;
  shapeClassName?: string;
  showHandles?: boolean;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  style?: React.CSSProperties;
}

export function BaseNodeShell({
  selected,
  data,
  children,
  shapeClassName = "",
  showHandles = true,
  resizable = false,
  minWidth = 120,
  minHeight = 44,
  style,
}: BaseNodeShellProps) {
  const baseStyle = getNodeStyle(data);

  return (
    <div
      className={[
        "group relative flex min-h-11 min-w-30 items-center justify-center",
        "px-4 py-2.5 text-center shadow-sm transition-shadow",
        selected ? "shadow-md ring-2 ring-offset-2" : "hover:shadow-md",
        shapeClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          ...baseStyle,
          ...style,
          ...(selected ? { "--tw-ring-color": "#6366f1" } : {}),
        } as React.CSSProperties
      }
    >
      {resizable && (
        <NodeResizer
          isVisible={selected}
          minWidth={minWidth}
          minHeight={minHeight}
          lineClassName="border-indigo-500!"
          handleClassName="h-2.5! w-2.5! rounded-sm! border! border-indigo-500! bg-white!"
        />
      )}

      {showHandles && (
        <>
          {/* Connection handles on all four sides */}
          <Handle
            type="target"
            position={Position.Top}
            className="h-2.5! w-2.5! border-2! border-white! bg-slate-400!"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="h-2.5! w-2.5! border-2! border-white! bg-slate-400!"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className="h-2.5! w-2.5! border-2! border-white! bg-slate-400!"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="h-2.5! w-2.5! border-2! border-white! bg-slate-400!"
          />
        </>
      )}

      <span className="pointer-events-none w-full truncate">{children}</span>
    </div>
  );
}

// ─── Node wrapper components ───────────────────────────────────────────────────
// Each component receives NodeProps<DiagramNodeObject> from ReactFlow.
// `selected` and `data` are destructured from the full node props.

function DefaultNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell selected={selected} data={data} resizable>
      {data.label}
    </BaseNodeShell>
  );
}

function InputNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="[clip-path:polygon(8%_0%,100%_0%,92%_100%,0%_100%)]"
      resizable
    >
      {data.label}
    </BaseNodeShell>
  );
}

function OutputNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="[clip-path:polygon(0%_0%,92%_0%,100%_100%,8%_100%)]"
      resizable
    >
      {data.label}
    </BaseNodeShell>
  );
}

function CircleNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="rounded-full aspect-square"
      resizable
      minWidth={80}
      minHeight={80}
    >
      {data.label}
    </BaseNodeShell>
  );
}

function DiamondNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="[clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]"
      resizable
      minWidth={100}
      minHeight={100}
    >
      {data.label}
    </BaseNodeShell>
  );
}

function CylinderNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="rounded-[40%/15%]"
      resizable
      minWidth={100}
      minHeight={70}
    >
      {data.label}
    </BaseNodeShell>
  );
}

function ParallelogramNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="[clip-path:polygon(10%_0%,100%_0%,90%_100%,0%_100%)]"
      resizable
    >
      {data.label}
    </BaseNodeShell>
  );
}

function HexagonNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="[clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"
      resizable
      minWidth={100}
      minHeight={80}
    >
      {data.label}
    </BaseNodeShell>
  );
}

function TextNode({ selected, data }: DiagramNodeProps) {
  // Text nodes are transparent — no border, no background, no handles
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      showHandles={false}
      style={{ background: "transparent", border: "none", boxShadow: "none" }}
    >
      {data.label}
    </BaseNodeShell>
  );
}

function NoteNode({ selected, data }: DiagramNodeProps) {
  return (
    <BaseNodeShell
      selected={selected}
      data={data}
      shapeClassName="[clip-path:polygon(0%_0%,85%_0%,100%_15%,100%_100%,0%_100%)]"
      resizable
    >
      {data.label}
    </BaseNodeShell>
  );
}

// ─── nodeTypes registry ────────────────────────────────────────────────────────
// Keys match DiagramNodeType exactly.
// satisfies validates the shape without widening to NodeTypes.

export const nodeTypes = {
  defaultNode: DefaultNode,
  inputNode: InputNode,
  outputNode: OutputNode,
  circleNode: CircleNode,
  diamondNode: DiamondNode,
  cylinderNode: CylinderNode,
  parallelogramNode: ParallelogramNode,
  hexagonNode: HexagonNode,
  textNode: TextNode,
  noteNode: NoteNode,
} satisfies Record<DiagramNodeType, React.ComponentType<DiagramNodeProps>>;
