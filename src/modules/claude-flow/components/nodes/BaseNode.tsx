"use client";

import React, { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Handle,
  Position,
  NodeResizeControl,
  ResizeControlVariant,
  useStore,
  useUpdateNodeInternals,
  type NodeProps,
  type Node,
  type OnResize,
} from "@xyflow/react";
import { ExternalLink, Layers, ImageIcon, Upload, FileArchive, Plus, Minus, GripHorizontal, Rows3, Columns3, HelpCircle, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RotateHandle } from "./RotateHandle";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui-custom/combobox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDiagramStore } from "../../store";
import type { DiagramNodeData, DiagramNodeType, ArithmeticOperation } from "../../types";
import { getShapeGeometry, SHAPE_DEFAULT_SIZE } from "../../utils/shapes";
import { resolveNodeColors } from "../../utils/colors";
import { OPERATOR_ARITY, OPERATOR_SYMBOL, OPERATOR_LABEL } from "../../utils/operators";
import { UNIT_OPTIONS, unitWithPower, geometryModePower } from "../../utils/units";
import { MATH_CONSTANTS, MATH_CONSTANT_BY_KEY, MATH_CONSTANT_OPTIONS } from "../../utils/constants";
import { parseDelimitedText, pasteIntoGrid, toNumberCell, parseSpreadsheetFile } from "../../utils/tabularData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ShapeSchematic } from "./ShapeSchematic";
import {
  GEOMETRY_SHAPE_FIELDS,
  GEOMETRY_SHAPE_MODES,
  computeGeometry,
  BEAM_SHAPE_FIELDS,
  computeSecondMomentOfArea,
  isBeamCompatible,
  isVolumetricShape,
  validateBeamInputs,
  BEAM_VALIDATION_FALLBACKS,
  toBeamInputs,
  type GeometryShape,
  type GeometryMode,
  type BeamShape,
} from "../../utils/geometry";

// â”€â”€â”€ Font weight lookup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FONT_WEIGHT_MAP: Record<string, number> = {
  normal: 400,
  semibold: 600,
  bold: 700,
};

// â”€â”€â”€ Typed node alias â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ReactFlow v12+ requires Node<TData, TType> â€” not just the data shape.
type DiagramNodeObject = Node<DiagramNodeData, DiagramNodeType>;
type DiagramNodeProps = NodeProps<DiagramNodeObject>;

/** Falls back to plain English if a `Flow.<key>` translation is missing —
 *  next-intl throws on missing keys, so every string this file introduces
 *  goes through this instead of a bare t(). Same pattern as NodePalette.tsx
 *  and EditorSettingsDialog.tsx's local safeT helpers. */
function safeT(t: ReturnType<typeof useTranslations>, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}

/** Opens a node's link in a new tab. Bare hosts ("example.com") get "https://" prefixed. */
function openNodeLink(url: string | undefined) {
  if (!url?.trim()) return;
  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

/**
 * Shared numeric field for every calculator node (NumberNode, ShapeNode,
 * GeometryCalcNode, BeamCalcNode). Built on the project's own `Input`
 * component instead of a bare `<input>`, for two reasons:
 *  1. Digits are always left-aligned + LTR, regardless of the app's active
 *     RTL/Persian locale — numbers reading right-to-left inside a formula
 *     field is confusing no matter what language the UI is in.
 *  2. `style={{ colorScheme }}` is set explicitly from the diagram's own
 *     light/dark toggle (`settings.colorMode`) rather than inheriting the
 *     page-wide `color-scheme: light dark`, which is what made the native
 *     number spinner arrows render white-on-white inside a dark node.
 */
function NumberField({
  value,
  onChange,
  colorMode,
  className,
  style,
}: {
  value: number | string;
  onChange: (value: number) => void;
  colorMode: "light" | "dark";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Input
      type="number"
      dir="ltr"
      style={{ colorScheme: colorMode, ...style }}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        "nodrag h-7 w-20 rounded border-black/10 bg-white/70 px-1.5 py-0.5 text-start text-xs dark:border-white/10 dark:bg-black/20",
        className,
      )}
    />
  );
}

// "Precise-border easy connect" (https://reactflow.dev/examples/nodes/easy-connect):
// the visible dot stays tiny/exact, but every handle also gets an invisible
// ::after box extended 8px past its own edges on all sides — roughly tripling
// the real clickable/draggable hit-area without changing how the handle looks,
// so starting a connection is far more forgiving while the node's border stays crisp.
const HANDLE_CLS = "h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']";

const RESIZE_LINE_CLS = "border-indigo-500! border-dashed!";
const RESIZE_DOT_CLS = "h-2.5! w-2.5! rounded-sm! border! border-indigo-500! bg-indigo-500!";

// Slight outward offset so the dashed frame reads as its own outline instead
// of sitting flush on the node's own border — same offset applied to both
// the lines and the corner dots so a dot's center always lands exactly on
// where its two adjoining dashed lines actually meet.
const RESIZE_OFFSET = 5;
const LINE_OFFSET_STYLE: Record<"top" | "bottom" | "left" | "right", React.CSSProperties> = {
  top: { transform: `translateY(-${RESIZE_OFFSET}px)` },
  bottom: { transform: `translateY(${RESIZE_OFFSET}px)` },
  left: { transform: `translateX(-${RESIZE_OFFSET}px)` },
  right: { transform: `translateX(${RESIZE_OFFSET}px)` },
};
const CORNER_OFFSET_STYLE: Record<"top-left" | "top-right" | "bottom-left" | "bottom-right", React.CSSProperties> = {
  "top-left": { transform: `translate(-${RESIZE_OFFSET}px, -${RESIZE_OFFSET}px)`, cursor: "nwse-resize" },
  "top-right": { transform: `translate(${RESIZE_OFFSET}px, -${RESIZE_OFFSET}px)`, cursor: "nesw-resize" },
  "bottom-left": { transform: `translate(-${RESIZE_OFFSET}px, ${RESIZE_OFFSET}px)`, cursor: "nesw-resize" },
  "bottom-right": { transform: `translate(${RESIZE_OFFSET}px, ${RESIZE_OFFSET}px)`, cursor: "nwse-resize" },
};

/**
 * Every shape/calculator node also has a connection dot sitting at each of
 * the 4 edge MIDPOINTS (top/bottom/left/right — see FreeConnectHandles
 * above). Plain <NodeResizer> auto-generates handles at all 4 corners *and*
 * all 4 edge midpoints, which land exactly on top of those connection dots —
 * the resize handle and the connection dot fight for the same pixel, which
 * is what made the resize frame look like its handles were "in the wrong
 * place". Built from individual <NodeResizeControl> pieces instead: resize
 * DOTS only at the 4 corners (nothing there to collide with), plus the 4
 * edge LINES for the drag-frame outline and edge-resizing — lines don't
 * visually clash with a small dot handle the way another dot would.
 */
function CornerResizer({
  isVisible,
  minWidth,
  minHeight,
  onResize,
}: {
  isVisible: boolean;
  minWidth: number;
  minHeight: number;
  onResize: OnResize;
}) {
  if (!isVisible) return null;
  return (
    <>
      <NodeResizeControl position="top" variant={ResizeControlVariant.Line} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_LINE_CLS} style={LINE_OFFSET_STYLE.top} />
      <NodeResizeControl position="bottom" variant={ResizeControlVariant.Line} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_LINE_CLS} style={LINE_OFFSET_STYLE.bottom} />
      <NodeResizeControl position="left" variant={ResizeControlVariant.Line} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_LINE_CLS} style={LINE_OFFSET_STYLE.left} />
      <NodeResizeControl position="right" variant={ResizeControlVariant.Line} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_LINE_CLS} style={LINE_OFFSET_STYLE.right} />
      <NodeResizeControl position="top-left" variant={ResizeControlVariant.Handle} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_DOT_CLS} style={CORNER_OFFSET_STYLE["top-left"]} />
      <NodeResizeControl position="top-right" variant={ResizeControlVariant.Handle} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_DOT_CLS} style={CORNER_OFFSET_STYLE["top-right"]} />
      <NodeResizeControl position="bottom-left" variant={ResizeControlVariant.Handle} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_DOT_CLS} style={CORNER_OFFSET_STYLE["bottom-left"]} />
      <NodeResizeControl position="bottom-right" variant={ResizeControlVariant.Handle} minWidth={minWidth} minHeight={minHeight} onResize={onResize} className={RESIZE_DOT_CLS} style={CORNER_OFFSET_STYLE["bottom-right"]} />
    </>
  );
}

/**
 * "Any handle connects to any handle" (per user request — ordinary diagram
 * shapes have no logical reason to restrict which side a connection starts
 * or ends on). Instead of one ambiguous handle per side that has to serve
 * as both a source AND a target (which is what caused the top handle to
 * sometimes visually behave like the bottom one — React Flow's connection
 * line preview could resolve to the wrong handle when a single id had to
 * answer both "where do drags from here start" and "can drops land here"),
 * every side gets a real target handle UNDERNEATH (a pure, unambiguous drop
 * target) and a real source handle ON TOP (rendered after, so it wins the
 * mousedown when starting a new drag). Visually they sit exactly on top of
 * each other and look like a single dot.
 */
function FreeConnectHandles() {
  return (
    <>
      {/* Target handles — pure drop targets, rendered first (underneath) */}
      <Handle type="target" position={Position.Top} id="top-in" className={HANDLE_CLS} />
      <Handle type="target" position={Position.Bottom} id="bottom-in" className={HANDLE_CLS} />
      <Handle type="target" position={Position.Left} id="left-in" className={HANDLE_CLS} />
      <Handle type="target" position={Position.Right} id="right-in" className={HANDLE_CLS} />
      {/* Source handles — where new connections start from, rendered last (on top) */}
      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLS} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLS} />
    </>
  );
}

// â”€â”€â”€ ShapeCanvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Shared renderer used by every node wrapper below. Draws the shape as real
// SVG (see utils/shapes.ts), keeps its pixel size on node.data so resizing
// persists, and shows a link badge when data.url is set.

/** Start terminator: only ONE outgoing handle — nothing should ever flow
 *  INTO a "Start" node, so no target handle is rendered at all. */
function SingleSourceHandle() {
  return <Handle type="source" position={Position.Bottom} id="out" className={HANDLE_CLS} />;
}

/** End terminator: only ONE incoming handle — nothing should ever flow OUT
 *  of an "End" node (which also naturally keeps it from triggering
 *  add-node-on-edge-drop, since that only fires from a source handle). */
function SingleTargetHandle() {
  return <Handle type="target" position={Position.Top} id="in" className={HANDLE_CLS} />;
}

interface ShapeCanvasProps {
  id: string;
  shape: DiagramNodeType;
  data: DiagramNodeData;
  selected?: boolean;
  /** Whether to render any connection handles at all. */
  showConnectionHandles?: boolean;
  /** Which handle set to render when showConnectionHandles is true:
   *  - "full": all 4 sides, both source & target (default, ordinary shapes)
   *  - "sourceOnly": a single outgoing handle (Start/inputNode)
   *  - "targetOnly": a single incoming handle (End/outputNode) */
  handleMode?: "full" | "sourceOnly" | "targetOnly";
  /** Whether to render the resize handles. Independent from connection
   *  handles — e.g. textNode has no connection handles but IS resizable. */
  showResizer?: boolean;
  /** Enables the drag-to-rotate handle (currently only textNode uses this). */
  rotatable?: boolean;
}

function ShapeCanvas({
  id,
  shape,
  data,
  selected,
  showConnectionHandles = true,
  handleMode = "full",
  showResizer = true,
  rotatable = false,
}: ShapeCanvasProps) {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  // Contextual zoom (https://reactflow.dev/examples/interaction/contextual-zoom):
  // swap detail level based on the live viewport zoom, rather than just
  // letting text shrink uniformly with the canvas.
  const zoom = useStore((s) => s.transform[2]);
  const showLabel = zoom > 0.35;
  const showDescription = zoom > 0.9 && !!data.description;

  const fallback = SHAPE_DEFAULT_SIZE[shape];
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;

  // Resolves the fixed light/dark color-token palette, falling back to any
  // legacy raw hex the node already carries (see utils/colors.ts).
  const resolved = resolveNodeColors(data, colorMode);
  const fill = resolved.background;
  const baseStroke = resolved.border;
  const baseStrokeWidth = data.borderWidth ?? 1.5;
  const strokeDasharray =
    data.borderStyle === "dashed" ? "6 4" : data.borderStyle === "dotted" ? "1.5 3.5" : undefined;

  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const stroke = selected ? selectedStroke : baseStroke;
  const strokeWidth = selected ? baseStrokeWidth + 1 : baseStrokeWidth;

  const geometry = getShapeGeometry(shape, width, height, data.borderRadius ?? 8);
  const hasLink = !!data.url?.trim();

  // Label wrapping: instead of always forcing a single truncated line, work
  // out how many lines actually fit the node's current height and clamp to
  // that — small nodes get one truncated line, taller ones wrap to several
  // lines before cutting off with an ellipsis.
  const fontSize = data.fontSize ?? 13;
  const lineHeightPx = fontSize * 1.3;
  const descriptionReserve = showDescription ? lineHeightPx * 0.85 : 0;
  const verticalPadding = 16;
  const availableHeight = Math.max(height - verticalPadding - descriptionReserve, lineHeightPx);
  const maxLines = Math.max(1, Math.floor(availableHeight / lineHeightPx));

  const handleResize = useCallback<OnResize>(
    (_event, params) => {
      updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) });
    },
    [id, updateNodeData],
  );

  // Computed once and reused for BOTH the resizer's own constraint AND the
  // node's actual CSS floor (minWidth/minHeight below) — previously these
  // were two independent numbers, so at small sizes the dashed resize frame
  // could show a size the node itself refused to actually shrink to.
  const minShapeWidth = Math.max(36, Math.round(fallback.width * 0.5));
  const minShapeHeight = Math.max(28, Math.round(fallback.height * 0.5));

  return (
    <div
      ref={outerRef}
      className="group relative"
      style={{ width, height, minWidth: minShapeWidth, minHeight: minShapeHeight }}
      onDoubleClick={() => openNodeLink(data.url)}
      title={hasLink ? data.url : undefined}
    >
      {showResizer && (
        <CornerResizer
          isVisible={!!selected}
          minWidth={minShapeWidth}
          minHeight={minShapeHeight}
          onResize={handleResize}
        />
      )}

      {/* Rotation (https://reactflow.dev/examples/nodes/rotatable-node):
          the shape + label live inside this rotated wrapper, and so does the
          handle when rotatable — that's what makes the handle move/rotate
          along with the node rather than staying fixed on screen. NodeResizer
          and connection handles stay OUTSIDE (unrotated) on purpose: resize
          corners and connection points are much easier to use fixed to the
          screen axes regardless of the shape's current rotation. */}
      <div className="relative h-full w-full" style={rotatable ? { transform: `rotate(${data.rotation ?? 0}deg)` } : undefined}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block overflow-visible"
        style={{
          filter: selected
            ? "drop-shadow(0 2px 6px rgba(99,102,241,0.35))"
            : "drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
        }}
      >
        {geometry.kind === "path" && (
          <path d={geometry.path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
        )}

        {geometry.kind === "ellipse" && (
          <ellipse
            cx={geometry.cx}
            cy={geometry.cy}
            rx={geometry.rx}
            ry={geometry.ry}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        )}

        {geometry.kind === "cylinder" && (
          <>
            <path d={geometry.bodyPath} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
            <ellipse
              cx={geometry.capCx}
              cy={geometry.capCy}
              rx={geometry.capRx}
              ry={geometry.capRy}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
          </>
        )}

        {geometry.kind === "note" && (
          <>
            <path d={geometry.outline} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
            <path d={geometry.fold} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          </>
        )}

        {geometry.kind === "predefinedProcess" && (
          <>
            <path d={geometry.outer} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
            <line x1={geometry.barX1} x2={geometry.barX1} y1={geometry.barTop} y2={geometry.barBottom} stroke={stroke} strokeWidth={strokeWidth} />
            <line x1={geometry.barX2} x2={geometry.barX2} y1={geometry.barTop} y2={geometry.barBottom} stroke={stroke} strokeWidth={strokeWidth} />
          </>
        )}
      </svg>

      {/* Label + optional description, overlaid on top of the SVG shape */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-3 text-center"
        style={{
          color: resolved.text,
          fontSize: data.fontSize ?? 13,
          fontWeight: FONT_WEIGHT_MAP[data.fontWeight ?? "normal"] ?? 400,
          lineHeight: 1.3,
        }}
      >
        {data.isRichText ? (
          <span
            className="w-full"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: maxLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
            // Rich-text labels (toggled via the "Render as HTML" checkbox in
            // SettingsPanel) — this is the user's own diagram content, typed
            // by themselves, not remote/untrusted input.
            dangerouslySetInnerHTML={{ __html: showLabel ? data.label : "" }}
          />
        ) : (
          <span
            className="w-full"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: maxLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {showLabel ? data.label : ""}
          </span>
        )}
        {showDescription && (
          <span className="w-full truncate text-[11px] opacity-70">{data.description}</span>
        )}
      </div>

      {rotatable && selected && (
        <RotateHandle
          nodeRef={outerRef}
          rotation={data.rotation ?? 0}
          onRotate={(deg) => updateNodeData(id, { rotation: deg })}
        />
      )}
      </div>

      {/* Link badge â€” visible when the node carries a URL; click opens it directly. */}
      {hasLink && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openNodeLink(data.url);
          }}
          title={data.url}
          className="nodrag absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm transition-transform hover:scale-110"
        >
          <ExternalLink className="size-3" />
        </button>
      )}

      {showConnectionHandles && handleMode === "full" && <FreeConnectHandles />}
      {showConnectionHandles && handleMode === "sourceOnly" && <SingleSourceHandle />}
      {showConnectionHandles && handleMode === "targetOnly" && <SingleTargetHandle />}
    </div>
  );
}

// â”€â”€â”€ Node wrapper components (one per DiagramNodeType) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Kept as separate functions (rather than deriving the shape from props.type)
// so the `nodeTypes` registry below stays explicit and each node type is
// trivially greppable.

function DefaultNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="defaultNode" data={data} selected={selected} />;
}

function InputNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="inputNode" data={data} selected={selected} handleMode="sourceOnly" />;
}

function OutputNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="outputNode" data={data} selected={selected} handleMode="targetOnly" />;
}

function CircleNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="circleNode" data={data} selected={selected} />;
}

function DiamondNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="diamondNode" data={data} selected={selected} />;
}

function CylinderNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="cylinderNode" data={data} selected={selected} />;
}

function ParallelogramNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="parallelogramNode" data={data} selected={selected} />;
}

function HexagonNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="hexagonNode" data={data} selected={selected} />;
}

function TextNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="textNode" data={data} selected={selected} showConnectionHandles={false} rotatable />;
}

function NoteNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="noteNode" data={data} selected={selected} />;
}

function TriangleNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="triangleNode" data={data} selected={selected} />;
}

function CloudNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="cloudNode" data={data} selected={selected} />;
}

function DocumentNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="documentNode" data={data} selected={selected} />;
}

function PredefinedProcessNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="predefinedProcessNode" data={data} selected={selected} />;
}

function DelayNode({ id, selected, data }: DiagramNodeProps) {
  return <ShapeCanvas id={id} shape="delayNode" data={data} selected={selected} />;
}

// GroupNode (subflow container): a resizable box other nodes can be dropped/dragged
// into (see reparentNode in ../../store and onNodeDragStop in DiagramCanvas.tsx).
// Draggable ONLY by its header (the ".subflow-drag-handle" element below) — the
// node instance sets `dragHandle: '.subflow-drag-handle'` at creation time so
// dragging the body doesn't fight with dragging the children inside it.
function GroupNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);

  const fallback = SHAPE_DEFAULT_SIZE.groupNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const borderColor = selected ? selectedStroke : resolved.border;

  const handleResize = useCallback<OnResize>(
    (_event, params) => {
      updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) });
    },
    [id, updateNodeData],
  );

  return (
    <div className="relative" style={{ width, height, minWidth: 200, minHeight: 140 }}>
      <CornerResizer
        isVisible={!!selected}
        minWidth={200}
        minHeight={140}
        onResize={handleResize}
      />

      <div
        className="subflow-drag-handle absolute inset-x-0 top-0 z-10 flex h-7 cursor-grab items-center gap-1.5 rounded-t-lg px-2.5 text-xs font-semibold active:cursor-grabbing"
        style={{ backgroundColor: borderColor, color: "#ffffff" }}
      >
        <Layers className="size-3.5 shrink-0" />
        <span className="truncate">{data.label}</span>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 rounded-b-lg"
        style={{
          top: 28,
          backgroundColor: resolved.background,
          opacity: colorMode === "dark" ? 0.35 : 0.6,
          borderLeftWidth: 1.5,
          borderRightWidth: 1.5,
          borderBottomWidth: 1.5,
          borderTopWidth: 0,
          borderLeftStyle: "dashed",
          borderRightStyle: "dashed",
          borderBottomStyle: "dashed",
          borderLeftColor: borderColor,
          borderRightColor: borderColor,
          borderBottomColor: borderColor,
        }}
      />

      <FreeConnectHandles />
    </div>
  );
}

// ── Computing flows (https://reactflow.dev/learn/advanced-use/computing-flows) ──
// Two small interactive nodes: a literal NUMBER you type into, and an
// OPERATOR that combines whatever values flow into it and republishes the
// result (data.result) for the next node downstream. The actual computation
// runs in the store (recomputeValues) whenever the graph or a value changes.

function NumberNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.numberNode;
  const width = data.width ?? fallback.width;

  return (
    <div
      className="flex flex-col gap-1 rounded-lg px-3 py-2 shadow-sm"
      style={{
        width,
        backgroundColor: resolved.background,
        border: `1.5px solid ${selected ? selectedStroke : resolved.border}`,
      }}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: resolved.text, opacity: 0.7 }}>
        {data.label || safeT(t, "nodes.numberNode", "Number")}
      </span>
      <NumberField
        value={data.value ?? 0}
        onChange={(v) => updateNodeData(id, { value: v })}
        colorMode={colorMode}
        className="w-full text-sm font-semibold"
        style={{ color: resolved.text }}
      />
      <Handle type="source" position={Position.Right} id="right" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
    </div>
  );
}

/**
 * A picklist of common dimensionless mathematical constants (π, e, φ, ...)
 * with a short description for each — a library, not a free-typed number.
 * Outputs its selected value through a single source handle, so it can feed
 * an OperatorNode exactly like NumberNode does (see utils/constants.ts).
 */
function ConstantNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.constantNode;
  const width = data.width ?? fallback.width;

  const constant = MATH_CONSTANT_BY_KEY[data.constantKey ?? "pi"] ?? MATH_CONSTANTS[0];

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg px-3 py-2 shadow-sm"
      style={{
        width,
        backgroundColor: resolved.background,
        border: `1.5px solid ${selected ? selectedStroke : resolved.border}`,
      }}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: resolved.text, opacity: 0.7 }}>
        {data.label || safeT(t, "nodes.constantNode", "Constant")}
      </span>

      <div className="nodrag">
        <Combobox
          options={MATH_CONSTANT_OPTIONS}
          value={constant.key}
          onChange={(v) => updateNodeData(id, { constantKey: v })}
          placeholder={safeT(t, "settings.constant", "Constant...")}
        />
      </div>

      <div className="nodrag flex items-baseline justify-between gap-2 rounded border border-black/10 bg-white/70 px-2 py-1 dark:bg-black/20">
        <span className="text-base font-bold" style={{ color: resolved.text }}>{constant.symbol}</span>
        <span className="truncate text-sm font-semibold" style={{ color: resolved.text }}>
          {Number(constant.value.toFixed(6))}
        </span>
      </div>

      <p className="text-[10px] leading-snug opacity-70" style={{ color: resolved.text }}>
        {constant.description}
      </p>

      <Handle type="source" position={Position.Right} id="right" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
    </div>
  );
}
 /* only makes sense with ONE input, divide/subtract/power need exactly TWO
 * in a specific order (a÷b ≠ b÷a), so those get individually labeled "a"/"b"
 * handles instead of one shared unlimited handle. See utils/operators.ts for
 * the single source of truth this mirrors in the store's recompute logic.
 */
function OperatorNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const updateNodeInternals = useUpdateNodeInternals();
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.operatorNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;
  const operation = data.operation ?? "add";
  const arity = OPERATOR_ARITY[operation];

  // React Flow caches each node's handle bounds — when the SET of handles
  // changes (switching arity swaps how many handles exist), it must be told
  // to re-measure, or edges connected to now-stale handle positions won't
  // follow correctly.
  const handleOperationChange = useCallback(
    (op: ArithmeticOperation) => {
      updateNodeData(id, { operation: op });
      requestAnimationFrame(() => updateNodeInternals(id));
    },
    [id, updateNodeData, updateNodeInternals],
  );

  return (
    <div
      className="relative flex flex-col gap-1 rounded-lg px-3 py-2 shadow-sm"
      style={{
        width,
        minHeight: height,
        backgroundColor: resolved.background,
        border: `1.5px solid ${selected ? selectedStroke : resolved.border}`,
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: resolved.text, opacity: 0.7 }}>
          {data.label || safeT(t, "nodes.operatorNode", "Operator")}
        </span>
        <span className="text-xs font-bold" style={{ color: resolved.text }}>
          {OPERATOR_SYMBOL[operation]}
        </span>
      </div>

      <div className="nodrag">
        <Combobox
          options={(Object.keys(OPERATOR_LABEL) as ArithmeticOperation[]).map((op) => ({ value: op, label: OPERATOR_LABEL[op] }))}
          value={operation}
          onChange={(v) => handleOperationChange(v as ArithmeticOperation)}
          placeholder={safeT(t, "settings.operation", "Operation...")}
        />
      </div>

      <div
        className="nodrag rounded border border-black/10 bg-white/70 px-2 py-1 text-center text-sm font-semibold dark:bg-black/20"
        style={{ color: resolved.text }}
      >
        {data.result !== undefined ? Number(data.result.toFixed(3)) : "—"}
      </div>

      {arity === "nary" && (
        <>
          <Handle type="target" position={Position.Left} id="left" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
          <span className="pointer-events-none absolute inset-s-0 top-1/2 -translate-x-3 -translate-y-1/2 text-[9px] opacity-50 rtl:translate-x-3">
            +
          </span>
        </>
      )}

      {arity === "binary" && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="a"
            style={{ top: "35%" }}
            className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']"
          />
          <span className="pointer-events-none absolute inset-s-0 -translate-x-3 text-[9px] opacity-50 rtl:translate-x-3" style={{ top: "35%" }}>
            a
          </span>
          <Handle
            type="target"
            position={Position.Left}
            id="b"
            style={{ top: "70%" }}
            className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']"
          />
          <span className="pointer-events-none absolute inset-s-0 -translate-x-3 text-[9px] opacity-50 rtl:translate-x-3" style={{ top: "70%" }}>
            b
          </span>
        </>
      )}

      {arity === "unary" && (
        <>
          <Handle type="target" position={Position.Left} id="x" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
          <span className="pointer-events-none absolute inset-s-0 top-1/2 -translate-x-3 -translate-y-1/2 text-[9px] opacity-50 rtl:translate-x-3">
            x
          </span>
        </>
      )}

      <Handle type="source" position={Position.Right} id="right" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
    </div>
  );
}

// ── Standalone calculators ──────────────────────────────────────────────
// Unlike numberNode/operatorNode, these don't need any incoming edges — all
// their inputs live on the node itself, so the result is just computed
// directly in the component (utils/geometry.ts) on every render.

const GEOMETRY_SHAPE_LABELS: Record<GeometryShape, string> = {
  rectangle: "Rectangle",
  square: "Square",
  circle: "Circle",
  triangle: "Triangle",
  cylinder: "Cylinder",
  sphere: "Sphere",
  cuboid: "Cuboid (box)",
  hollowCircle: "Hollow circle (tube)",
  iBeam: "I-beam / H-beam",
};

const GEOMETRY_MODE_LABELS: Record<GeometryMode, string> = {
  perimeter: "Perimeter",
  area: "Area",
  volume: "Volume",
};

/** Finds the upstream shapeNode feeding a calculator's input handle, if any.
 *  When connected, the calculator uses THIS node's shape/inputs instead of
 *  its own standalone fields — see components/nodes/BaseNode.tsx's ShapeNode. */
function useUpstreamShapeNode(id: string): Node<DiagramNodeData> | undefined {
  const edges = useDiagramStore((s) => s.edges);
  const nodes = useDiagramStore((s) => s.nodes);
  const incoming = edges.find((e) => e.target === id);
  const source = incoming ? nodes.find((n) => n.id === incoming.source) : undefined;
  return source?.type === "shapeNode" ? source : undefined;
}

/** Rounds to 3 decimals for display so results never overflow the node box (per user request). */
function formatCalcResult(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return Number(value.toFixed(3)).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function GeometryCalcNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.geometryCalcNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;

  // If a shapeNode is connected to our input handle, use ITS shape/inputs
  // (read-only here — edit them on the shapeNode itself) instead of our own
  // standalone dropdown+fields. Lets you build Shape → Calculator pipelines.
  const upstream = useUpstreamShapeNode(id);
  const shape = (upstream ? upstream.data.shapeKind : data.calcShape) ?? "rectangle";
  const inputs = (upstream ? upstream.data.shapeInputs : data.calcInputs) ?? {};
  const availableModes = GEOMETRY_SHAPE_MODES[shape];
  const mode = availableModes.includes(data.calcMode ?? "area") ? data.calcMode ?? "area" : availableModes[0];
  const fields = GEOMETRY_SHAPE_FIELDS[shape];
  const result = computeGeometry(shape, mode, inputs);
  const unit = upstream ? upstream.data.unit : data.unit;

  const handleResize = useCallback<OnResize>(
    (_e, params) => updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) }),
    [id, updateNodeData],
  );

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg p-3 shadow-sm"
      style={{ width, minWidth: 180, minHeight: height, backgroundColor: resolved.background, border: `1.5px solid ${selected ? selectedStroke : resolved.border}` }}
    >
      <CornerResizer
        isVisible={!!selected}
        minWidth={180}
        minHeight={200}
        onResize={handleResize}
      />
      <Handle type="target" position={Position.Left} id="shape-in" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
      <Handle type="source" position={Position.Right} id="value-out" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />

      <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: resolved.text, opacity: 0.7 }}>
        {data.label || safeT(t, "nodes.geometryCalcNode", "Geometry calculator")}
      </span>

      {upstream ? (
        <p className="nodrag rounded border border-dashed border-black/15 px-2 py-1 text-[11px] opacity-70" style={{ color: resolved.text }}>
          {safeT(t, "settings.shapeFrom", "Shape")}: {GEOMETRY_SHAPE_LABELS[shape]} (&ldquo;{upstream.data.label}&rdquo;)
        </p>
      ) : (
        <div className="nodrag">
          <Combobox
            options={(Object.keys(GEOMETRY_SHAPE_FIELDS) as GeometryShape[]).map((s) => ({ value: s, label: GEOMETRY_SHAPE_LABELS[s] }))}
            value={shape}
            onChange={(v) => updateNodeData(id, { calcShape: v as GeometryShape, calcInputs: {} })}
            placeholder={safeT(t, "settings.shape", "Shape...")}
          />
        </div>
      )}

      <div className="nodrag flex items-center gap-1.5">
        <span className="shrink-0 text-[10px] opacity-70" style={{ color: resolved.text }}>{safeT(t, "settings.unit", "Unit")}</span>
        {upstream ? (
          <span className="truncate text-[11px] font-medium" style={{ color: resolved.text }}>{upstream.data.unit || "—"}</span>
        ) : (
          <Combobox
            options={UNIT_OPTIONS}
            value={data.unit ?? ""}
            onChange={(v) => updateNodeData(id, { unit: v })}
            placeholder={safeT(t, "settings.unit", "Unit")}
            className="flex-1"
          />
        )}
      </div>

      <div className="h-36 shrink-0 rounded border border-black/10 bg-white/40 p-2 dark:bg-black/10" style={{ color: resolved.text }}>
        <ShapeSchematic shape={shape} />
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        value={mode}
        onValueChange={(v) => v && updateNodeData(id, { calcMode: v as GeometryMode })}
        className="nodrag grid w-full grid-cols-3 gap-1"
      >
        {availableModes.map((m) => (
          <ToggleGroupItem key={m} value={m} className="h-7 text-[11px]">
            {GEOMETRY_MODE_LABELS[m]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {!upstream && (
        <div className="flex flex-col gap-1">
          {fields.map((f) => (
            <label key={f.key} className="flex items-center justify-between gap-2 text-[11px]" style={{ color: resolved.text }}>
              <span className="opacity-70">{f.label}{unit ? ` (${unit})` : ""}</span>
              <NumberField
                value={inputs[f.key] ?? ""}
                onChange={(v) => updateNodeData(id, { calcInputs: { ...inputs, [f.key]: v } })}
                colorMode={colorMode}
                style={{ color: resolved.text }}
              />
            </label>
          ))}
        </div>
      )}

      <div className="mt-auto rounded border border-black/10 bg-white/70 px-2 py-1.5 text-center dark:bg-black/20">
        <div className="text-[10px] opacity-70" style={{ color: resolved.text }}>
          {GEOMETRY_MODE_LABELS[mode]}
        </div>
        <div className="truncate text-sm font-semibold" style={{ color: resolved.text }}>
          {formatCalcResult(result)}
          {result !== null && unit ? <span className="ms-1 text-xs font-normal opacity-70">{unitWithPower(unit, geometryModePower(mode))}</span> : null}
        </div>
      </div>
    </div>
  );
}

// Second moment of area (Ix) for common beam cross-sections — used in
// bending-stress/deflection calculations. See utils/geometry.ts for formulas.
const BEAM_SHAPE_LABELS: Record<BeamShape, string> = {
  rectangle: "Rectangle",
  circle: "Solid circle",
  hollowCircle: "Hollow circle (tube)",
  triangle: "Triangle",
  iBeam: "I-beam / H-beam",
};

function BeamCalcNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.beamCalcNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;

  const upstream = useUpstreamShapeNode(id);
  const upstreamShape = upstream?.data.shapeKind;
  const upstreamCompatible = upstreamShape ? isBeamCompatible(upstreamShape) : false;

  const shape = (upstream && upstreamCompatible ? (upstreamShape as BeamShape) : data.beamShape) ?? "rectangle";
  const inputs = upstream && upstreamCompatible ? toBeamInputs(upstreamShape!, upstream.data.shapeInputs ?? {}) : (data.beamInputs ?? {});
  const fields = BEAM_SHAPE_FIELDS[shape];
  const result = upstream && !upstreamCompatible ? null : computeSecondMomentOfArea(shape, inputs);
  const unit = (upstream ? upstream.data.unit : data.unit) || "mm";
  const validationError = upstream && !upstreamCompatible ? null : validateBeamInputs(shape, inputs);

  const handleResize = useCallback<OnResize>(
    (_e, params) => updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) }),
    [id, updateNodeData],
  );

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg p-3 shadow-sm"
      style={{ width, minWidth: 200, minHeight: height, backgroundColor: resolved.background, border: `1.5px solid ${selected ? selectedStroke : resolved.border}` }}
    >
      <CornerResizer
        isVisible={!!selected}
        minWidth={200}
        minHeight={220}
        onResize={handleResize}
      />
      <Handle type="target" position={Position.Left} id="shape-in" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
      <Handle type="source" position={Position.Right} id="value-out" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />

      <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: resolved.text, opacity: 0.7 }}>
        {data.label || safeT(t, "nodes.beamCalcNode", "Beam section (Ix)")}
      </span>

      {upstream ? (
        <p className="nodrag rounded border border-dashed border-black/15 px-2 py-1 text-[11px] opacity-70" style={{ color: resolved.text }}>
          {upstreamCompatible
            ? `${safeT(t, "settings.shapeFrom", "Shape")}: ${BEAM_SHAPE_LABELS[shape]} ("${upstream.data.label}")`
            : upstreamShape && isVolumetricShape(upstreamShape)
              ? safeT(t, "settings.beamVolumetricWarning", `"${upstream.data.label}" is a 3D/volumetric shape (${upstreamShape}) — bending Ix only applies to a 2D cross-section, not a solid.`)
              : safeT(t, "settings.beamNoFormula", `"${upstream.data.label}" has no Ix formula defined.`)}
        </p>
      ) : (
        <div className="nodrag">
          <Combobox
            options={(Object.keys(BEAM_SHAPE_FIELDS) as BeamShape[]).map((s) => ({ value: s, label: BEAM_SHAPE_LABELS[s] }))}
            value={shape}
            onChange={(v) => updateNodeData(id, { beamShape: v as BeamShape, beamInputs: {} })}
            placeholder={safeT(t, "settings.shape", "Shape...")}
          />
        </div>
      )}

      <div className="nodrag flex items-center gap-1.5">
        <span className="shrink-0 text-[10px] opacity-70" style={{ color: resolved.text }}>{safeT(t, "settings.unit", "Unit")}</span>
        {upstream ? (
          <span className="truncate text-[11px] font-medium" style={{ color: resolved.text }}>{upstream.data.unit || "mm"}</span>
        ) : (
          <Combobox
            options={UNIT_OPTIONS}
            value={data.unit ?? ""}
            onChange={(v) => updateNodeData(id, { unit: v })}
            placeholder="mm"
            className="flex-1"
          />
        )}
      </div>

      <div className="h-36 shrink-0 rounded border border-black/10 bg-white/40 p-2 dark:bg-black/10" style={{ color: resolved.text }}>
        <ShapeSchematic shape={shape} />
      </div>

      {!upstream && (
        <div className="flex flex-col gap-1">
          {fields.map((f) => (
            <label key={f.key} className="flex items-center justify-between gap-2 text-[11px]" style={{ color: resolved.text }}>
              <span className="opacity-70">{f.label}{unit ? ` (${unit})` : ""}</span>
              <NumberField
                value={inputs[f.key] ?? ""}
                onChange={(v) => updateNodeData(id, { beamInputs: { ...inputs, [f.key]: v } })}
                colorMode={colorMode}
                style={{ color: resolved.text }}
              />
            </label>
          ))}
        </div>
      )}

      {validationError && (
        <p className="nodrag rounded border border-amber-400/60 bg-amber-400/10 px-2 py-1 text-[11px] leading-snug text-amber-700 dark:text-amber-400">
          ⚠ {safeT(t, `beamValidation.${validationError}`, BEAM_VALIDATION_FALLBACKS[validationError])}
        </p>
      )}

      <div className="mt-auto rounded border border-black/10 bg-white/70 px-2 py-1.5 text-center dark:bg-black/20">
        <div className="text-[10px] opacity-70" style={{ color: resolved.text }}>
          {safeT(t, "settings.ixCaption", "Ix (second moment of area)")}
        </div>
        <div className="truncate text-sm font-semibold" style={{ color: resolved.text }}>
          {validationError ? "—" : formatCalcResult(result)}
          {!validationError && result !== null ? <span className="ms-1 text-xs font-normal opacity-70">{unitWithPower(unit, 4)}</span> : null}
        </div>
      </div>
    </div>
  );
}

// Pipeable shape definition — place one, pick a shape + dimensions, then
// connect its output handle into a geometryCalcNode's or beamCalcNode's
// input handle. Purely a data source: no computation happens here.
function ShapeNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.shapeNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;

  const shape = data.shapeKind ?? "rectangle";
  const inputs = data.shapeInputs ?? {};
  const fields = GEOMETRY_SHAPE_FIELDS[shape];

  const handleResize = useCallback<OnResize>(
    (_e, params) => updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) }),
    [id, updateNodeData],
  );

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg p-3 shadow-sm"
      style={{ width, minWidth: 170, minHeight: height, backgroundColor: resolved.background, border: `1.5px solid ${selected ? selectedStroke : resolved.border}` }}
    >
      <CornerResizer
        isVisible={!!selected}
        minWidth={170}
        minHeight={160}
        onResize={handleResize}
      />
      <Handle type="source" position={Position.Right} id="shape-out" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />

      <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: resolved.text, opacity: 0.7 }}>
        {data.label || safeT(t, "nodes.shapeNode", "Shape")}
      </span>

      <div className="nodrag">
        <Combobox
          options={(Object.keys(GEOMETRY_SHAPE_FIELDS) as GeometryShape[]).map((s) => ({ value: s, label: GEOMETRY_SHAPE_LABELS[s] }))}
          value={shape}
          onChange={(v) => updateNodeData(id, { shapeKind: v as GeometryShape, shapeInputs: {} })}
          placeholder={safeT(t, "settings.shape", "Shape...")}
        />
      </div>

      <div className="nodrag flex items-center gap-1.5">
        <span className="shrink-0 text-[10px] opacity-70" style={{ color: resolved.text }}>{safeT(t, "settings.unit", "Unit")}</span>
        <Combobox
          options={UNIT_OPTIONS}
          value={data.unit ?? ""}
          onChange={(v) => updateNodeData(id, { unit: v })}
          placeholder={safeT(t, "settings.unit", "Unit")}
          className="flex-1"
        />
      </div>

      <div className="h-36 shrink-0 rounded border border-black/10 bg-white/40 p-2 dark:bg-black/10" style={{ color: resolved.text }}>
        <ShapeSchematic shape={shape} />
      </div>

      <div className="flex flex-col gap-1">
        {fields.map((f) => (
          <label key={f.key} className="flex items-center justify-between gap-2 text-[11px]" style={{ color: resolved.text }}>
            <span className="opacity-70">{f.label}{data.unit ? ` (${data.unit})` : ""}</span>
            <NumberField
              value={inputs[f.key] ?? ""}
              onChange={(v) => updateNodeData(id, { shapeInputs: { ...inputs, [f.key]: v } })}
              colorMode={colorMode}
              style={{ color: resolved.text }}
            />
          </label>
        ))}
      </div>

      <p className="mt-auto text-[10px] italic opacity-60" style={{ color: resolved.text }}>
        Connect the dot on the right to a calculator&rsquo;s input.
      </p>
    </div>
  );
}

// Image node — paste a URL or upload a local file (stored as a data-URL).
// Resizable; its border width/style/radius/color come from the normal
// node-settings panel, same as any shape, so it doubles as a simple frame.
function ImageNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const t = useTranslations("Flow");
  const fallback = SHAPE_DEFAULT_SIZE.imageNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;
  const borderRadius = data.borderRadius ?? 8;
  const rotation = data.rotation ?? 0;
  const opacity = data.opacity ?? 100;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const outerRef = React.useRef<HTMLDivElement>(null);

  const handleResize = useCallback<OnResize>(
    (_e, params) => updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) }),
    [id, updateNodeData],
  );

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => updateNodeData(id, { imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    },
    [id, updateNodeData],
  );

  return (
    // NOTE: no border/frame here (per request) and, importantly, no
    // overflow-hidden on THIS element either — that used to sit on the same
    // div as the Handles, which clipped off half of each handle dot since
    // React Flow positions them slightly outside the node's own box. The
    // rounded-corner image clipping now happens on the INNER wrapper only,
    // which has no handles inside it to cut off.
    <div ref={outerRef} className="relative" style={{ width, height, minWidth: 80, minHeight: 60 }}>
      <CornerResizer
        isVisible={!!selected}
        minWidth={80}
        minHeight={60}
        onResize={handleResize}
      />
      <Handle type="target" position={Position.Top} id="top" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />

      {/* Rotation (https://reactflow.dev/examples/nodes/rotatable-node): the
          handle is a CHILD of this same rotated element, so it moves/rotates
          along with the node rather than staying fixed at a constant spot. */}
      <div className="relative h-full w-full" style={{ transform: `rotate(${rotation}deg)` }}>
        <div className="h-full w-full overflow-hidden shadow-sm" style={{ borderRadius }}>
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data-URLs/arbitrary external URLs aren't compatible with next/image's optimizer
            <img src={data.imageUrl} alt={data.label || "Image"} className="h-full w-full object-contain" draggable={false} style={{ opacity: opacity / 100 }} />
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="nodrag flex h-full w-full flex-col items-center justify-center gap-1.5 border-2 border-dashed border-black/15 text-muted-foreground transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-white/15"
            >
              <ImageIcon className="size-6 opacity-60" />
              <span className="flex items-center gap-1 text-[11px]">
                <Upload className="size-3" /> {safeT(t, "settings.uploadImage", "Upload image or SVG")}
              </span>
            </button>
          )}
        </div>

        {selected && (
          <RotateHandle
            nodeRef={outerRef}
            rotation={rotation}
            onRotate={(deg) => updateNodeData(id, { rotation: deg })}
          />
        )}

        {/* Opacity slider — only worth showing controls for once there's
            actually an image loaded, and only while selected. */}
        {selected && data.imageUrl && (
          <div
            className="nodrag absolute inset-x-0 -bottom-8 flex items-center gap-1.5 rounded-md bg-popover/95 px-2 py-1 text-[10px] text-popover-foreground shadow-sm"
            style={{ transform: `rotate(${-rotation}deg)` }}
          >
            <span className="shrink-0 opacity-70">{safeT(t, "settings.opacity", "Opacity")}</span>
            <Slider min={0} max={100} value={[opacity]} onValueChange={(v) => updateNodeData(id, { opacity: v[0] })} className="w-full" />
            <span className="w-7 shrink-0 text-end tabular-nums opacity-70">{opacity}%</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

const DEFAULT_TABLE_ROWS: string[][] = [
  ["Column 1", "Column 2", "Column 3"],
  ["", "", ""],
  ["", "", ""],
];

/**
 * A real editable table — a grid of cells (each its own input, so clicking
 * to edit is instant, no separate "edit mode"), with controls to add/remove
 * rows and columns and to toggle a styled header row. Drags via its own
 * header strip (like groupNode's `.subflow-drag-handle`) since the rest of
 * the node is wall-to-wall input fields.
 */
function TableNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.tableNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;

  const rows = data.tableRows && data.tableRows.length > 0 ? data.tableRows : DEFAULT_TABLE_ROWS;
  const hasHeader = data.tableHasHeader ?? true;
  const colCount = rows[0]?.length ?? 0;
  const activeCellRef = React.useRef({ r: 0, c: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseSpreadsheetFile(file)
      .then((rows) => updateNodeData(id, { tableRows: rows }))
      .catch((err) => console.error("Could not read spreadsheet file:", err));
    e.target.value = "";
  };

  const setCell = (r: number, c: number, value: string) => {
    const next = rows.map((row) => [...row]);
    next[r][c] = value;
    updateNodeData(id, { tableRows: next });
  };

  // Pasting a range copied from Excel/Sheets (tab-separated) or a .csv
  // snippet (comma-separated) lands starting at whichever cell was last
  // focused, growing the grid as needed — same behavior as pasting into an
  // actual spreadsheet past its current edge.
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    e.preventDefault();
    const incoming = parseDelimitedText(text);
    const { r, c } = activeCellRef.current;
    updateNodeData(id, { tableRows: pasteIntoGrid(rows, incoming, r, c) });
  };

  const addRow = () => {
    updateNodeData(id, { tableRows: [...rows.map((row) => [...row]), Array(colCount).fill("")] });
  };

  const removeRow = () => {
    if (rows.length <= 1) return;
    updateNodeData(id, { tableRows: rows.slice(0, -1).map((row) => [...row]) });
  };

  const addColumn = () => {
    updateNodeData(id, { tableRows: rows.map((row) => [...row, ""]) });
  };

  const removeColumn = () => {
    if (colCount <= 1) return;
    updateNodeData(id, { tableRows: rows.map((row) => row.slice(0, -1)) });
  };

  const handleResize = useCallback<OnResize>(
    (_event, params) => {
      updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) });
    },
    [id, updateNodeData],
  );

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg shadow-sm"
      style={{ width, minWidth: 200, minHeight: height, backgroundColor: resolved.background, border: `1.5px solid ${selected ? selectedStroke : resolved.border}` }}
    >
      <CornerResizer isVisible={!!selected} minWidth={200} minHeight={100} onResize={handleResize} />
      <FreeConnectHandles />

      {/* Drag handle + row/column controls — only shown while selected, like the resize frame */}
      <div
        className="table-drag-handle flex shrink-0 cursor-grab items-center justify-between gap-1 border-b px-2 py-1 active:cursor-grabbing"
        style={{ borderColor: resolved.border }}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <GripHorizontal className="size-3.5 shrink-0 opacity-50" style={{ color: resolved.text }} />
          <span className="truncate text-[11px] font-medium opacity-80" style={{ color: resolved.text }}>
            {data.label || safeT(t, "nodes.tableNode", "Table")}
          </span>
        </div>
        {selected && (
          <div className="nodrag flex shrink-0 items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.addRow", "Add row")} onClick={addRow}>
              <Rows3 className="size-3" /><Plus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.removeRow", "Remove row")} onClick={removeRow} disabled={rows.length <= 1}>
              <Rows3 className="size-3" /><Minus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.addColumn", "Add column")} onClick={addColumn}>
              <Columns3 className="size-3" /><Plus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.removeColumn", "Remove column")} onClick={removeColumn} disabled={colCount <= 1}>
              <Columns3 className="size-3" /><Minus className="-ms-1 size-2.5" />
            </Button>
            <Button
              variant={hasHeader ? "secondary" : "ghost"}
              size="icon-sm"
              className="size-6 text-[9px] font-bold"
              title={safeT(t, "settings.toggleHeaderRow", "Toggle header row")}
              onClick={() => updateNodeData(id, { tableHasHeader: !hasHeader })}
            >
              H
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6"
              title={safeT(t, "settings.importCsv", "Import CSV/TSV file")}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.tsv,.txt"
              className="hidden"
              onChange={handleFileImport}
            />
          </div>
        )}
      </div>

      {/* The grid itself — CSS grid so every column stays the same width
          across every row without any manual layout math. Paste a range
          copied from Excel/Sheets anywhere in here (see handlePaste). */}
      <div
        className="nodrag grid flex-1 overflow-auto"
        style={{ gridTemplateColumns: `repeat(${colCount}, minmax(64px, 1fr))` }}
        onPaste={handlePaste}
      >
        {rows.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              value={cell}
              onChange={(e) => setCell(r, c, e.target.value)}
              onFocus={() => { activeCellRef.current = { r, c }; }}
              className={cn(
                "min-w-0 border-b border-e px-2 py-1.5 text-xs outline-none focus:bg-primary/5",
                r === rows.length - 1 && "border-b-0",
                c === colCount - 1 && "border-e-0",
                hasHeader && r === 0 && "bg-black/5 font-semibold dark:bg-white/10",
              )}
              style={{ borderColor: resolved.border, color: resolved.text }}
            />
          )),
        )}
      </div>
    </div>
  );
}

/** Finds an upstream Table/Excel/Matrix node feeding this node's input handle. */
function useUpstreamTabularNode(id: string): Node<DiagramNodeData> | undefined {
  const edges = useDiagramStore((s) => s.edges);
  const nodes = useDiagramStore((s) => s.nodes);
  const incoming = edges.find((e) => e.target === id);
  const source = incoming ? nodes.find((n) => n.id === incoming.source) : undefined;
  return source && ["tableNode", "excelNode", "matrixNode"].includes(source.type ?? "") ? source : undefined;
}

/** Grid of strings out of ANY of Table/Excel/Matrix's own data shape, so
 *  downstream nodes (Matrix, Chart) can treat all three as interchangeable
 *  data sources. */
function tabularGridOf(node: Node<DiagramNodeData> | undefined): string[][] | undefined {
  if (!node) return undefined;
  if (node.type === "matrixNode") return node.data.matrixRows?.map((row) => row.map((n) => String(n)));
  return node.data.tableRows;
}

const DEFAULT_EXCEL_ROWS: string[][] = [
  ["Item", "Q1", "Q2"],
  ["", "", ""],
  ["", "", ""],
];

/**
 * Same editable grid as TableNode (paste-from-Excel, CSV/TSV file import,
 * add/remove row/col), framed as a dedicated data-source node: the file
 * import button is front-and-center instead of tucked into the controls
 * row, since this node's whole point is usually "bring in a spreadsheet",
 * not free-form note-taking. Feeds Matrix/Chart nodes the exact same way a
 * Table node does (see useUpstreamTabularNode/tabularGridOf above).
 */
function ExcelNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.excelNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;

  const rows = data.tableRows && data.tableRows.length > 0 ? data.tableRows : DEFAULT_EXCEL_ROWS;
  const hasHeader = data.tableHasHeader ?? true;
  const colCount = rows[0]?.length ?? 0;
  const activeCellRef = React.useRef({ r: 0, c: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const setCell = (r: number, c: number, value: string) => {
    const next = rows.map((row) => [...row]);
    next[r][c] = value;
    updateNodeData(id, { tableRows: next });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    e.preventDefault();
    const incoming = parseDelimitedText(text);
    const { r, c } = activeCellRef.current;
    updateNodeData(id, { tableRows: pasteIntoGrid(rows, incoming, r, c) });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseSpreadsheetFile(file)
      .then((rows) => updateNodeData(id, { tableRows: rows }))
      .catch((err) => console.error("Could not read spreadsheet file:", err));
    e.target.value = "";
  };

  const addRow = () => updateNodeData(id, { tableRows: [...rows.map((r) => [...r]), Array(colCount).fill("")] });
  const removeRow = () => rows.length > 1 && updateNodeData(id, { tableRows: rows.slice(0, -1).map((r) => [...r]) });
  const addColumn = () => updateNodeData(id, { tableRows: rows.map((r) => [...r, ""]) });
  const removeColumn = () => colCount > 1 && updateNodeData(id, { tableRows: rows.map((r) => r.slice(0, -1)) });

  const handleResize = useCallback<OnResize>(
    (_e, params) => updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) }),
    [id, updateNodeData],
  );

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg shadow-sm"
      style={{ width, minWidth: 220, minHeight: height, backgroundColor: resolved.background, border: `1.5px solid ${selected ? selectedStroke : resolved.border}` }}
    >
      <CornerResizer isVisible={!!selected} minWidth={220} minHeight={120} onResize={handleResize} />
      <FreeConnectHandles />

      <div className="table-drag-handle flex shrink-0 cursor-grab items-center justify-between gap-1 border-b px-2 py-1 active:cursor-grabbing" style={{ borderColor: resolved.border }}>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <FileArchive className="size-3.5 shrink-0 opacity-50" style={{ color: resolved.text }} />
          <span className="truncate text-[11px] font-medium opacity-80" style={{ color: resolved.text }}>
            {data.label || safeT(t, "nodes.excelNode", "Excel")}
          </span>
        </div>
        {selected && (
          <div className="nodrag flex shrink-0 items-center gap-0.5">
            <Button variant="secondary" size="icon-sm" className="size-6" title={safeT(t, "settings.importCsv", "Import CSV/TSV file")} onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-3" />
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.tsv,.txt" className="hidden" onChange={handleFileImport} />
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.addRow", "Add row")} onClick={addRow}>
              <Rows3 className="size-3" /><Plus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.removeRow", "Remove row")} onClick={removeRow} disabled={rows.length <= 1}>
              <Rows3 className="size-3" /><Minus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.addColumn", "Add column")} onClick={addColumn}>
              <Columns3 className="size-3" /><Plus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.removeColumn", "Remove column")} onClick={removeColumn} disabled={colCount <= 1}>
              <Columns3 className="size-3" /><Minus className="-ms-1 size-2.5" />
            </Button>
            <Button variant={hasHeader ? "secondary" : "ghost"} size="icon-sm" className="size-6 text-[9px] font-bold" title={safeT(t, "settings.toggleHeaderRow", "Toggle header row")} onClick={() => updateNodeData(id, { tableHasHeader: !hasHeader })}>
              H
            </Button>
          </div>
        )}
      </div>

      <div className="nodrag grid flex-1 overflow-auto" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(64px, 1fr))` }} onPaste={handlePaste}>
        {rows.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              value={cell}
              onChange={(e) => setCell(r, c, e.target.value)}
              onFocus={() => { activeCellRef.current = { r, c }; }}
              className={cn(
                "min-w-0 border-b border-e px-2 py-1.5 text-xs outline-none focus:bg-primary/5",
                r === rows.length - 1 && "border-b-0",
                c === colCount - 1 && "border-e-0",
                hasHeader && r === 0 && "bg-black/5 font-semibold dark:bg-white/10",
              )}
              style={{ borderColor: resolved.border, color: resolved.text }}
            />
          )),
        )}
      </div>
    </div>
  );
}

const DEFAULT_MATRIX_ROWS: number[][] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/**
 * Strictly-numeric grid (paste from Excel coerces every cell through
 * toNumberCell). Can also just mirror an upstream Table/Excel node's data —
 * same "connect for live values, otherwise edit your own" pattern used by
 * GeometryCalcNode/BeamCalcNode with an upstream ShapeNode.
 */
function MatrixNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.matrixNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;

  const upstream = useUpstreamTabularNode(id);
  const upstreamGrid = tabularGridOf(upstream);
  const ownRows = data.matrixRows && data.matrixRows.length > 0 ? data.matrixRows : DEFAULT_MATRIX_ROWS;
  // When mirroring an upstream node, skip its header row (if it has one) —
  // a matrix is all numbers, a header row of column names isn't one.
  const rows: (string | number)[][] = upstream
    ? (upstream.data.tableHasHeader ? (upstreamGrid ?? []).slice(1) : upstreamGrid ?? [])
    : ownRows;
  const colCount = rows[0]?.length ?? 0;
  const activeCellRef = React.useRef({ r: 0, c: 0 });

  // Coordination with upstream Table/Excel data: those are free text, a
  // Matrix is strictly numbers — flag it instead of silently turning
  // anything unparseable into a 0.
  const nonNumericCellCount = upstream
    ? rows.reduce(
        (acc, row) =>
          acc +
          row.filter((cell) => {
            const s = String(cell).trim();
            return s !== "" && !Number.isFinite(Number(s.replace(/,/g, "")));
          }).length,
        0,
      )
    : 0;
  const upstreamIsEmpty = !!upstream && rows.length === 0;

  const setCell = (r: number, c: number, value: number) => {
    const next = ownRows.map((row) => [...row]);
    next[r][c] = value;
    updateNodeData(id, { matrixRows: next });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (upstream) return;
    const text = e.clipboardData.getData("text");
    if (!text) return;
    e.preventDefault();
    const incoming = parseDelimitedText(text).map((row) => row.map(toNumberCell));
    const { r, c } = activeCellRef.current;
    updateNodeData(id, { matrixRows: pasteIntoGrid(ownRows.map((row) => row.map(String)), incoming.map((row) => row.map(String)), r, c).map((row) => row.map(toNumberCell)) });
  };

  const addRow = () => !upstream && updateNodeData(id, { matrixRows: [...ownRows.map((r) => [...r]), Array(colCount || 1).fill(0)] });
  const removeRow = () => !upstream && ownRows.length > 1 && updateNodeData(id, { matrixRows: ownRows.slice(0, -1).map((r) => [...r]) });
  const addColumn = () => !upstream && updateNodeData(id, { matrixRows: ownRows.map((r) => [...r, 0]) });
  const removeColumn = () => !upstream && colCount > 1 && updateNodeData(id, { matrixRows: ownRows.map((r) => r.slice(0, -1)) });

  const handleResize = useCallback<OnResize>(
    (_e, params) => updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) }),
    [id, updateNodeData],
  );

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg shadow-sm"
      style={{ width, minWidth: 160, minHeight: height, backgroundColor: resolved.background, border: `1.5px solid ${selected ? selectedStroke : resolved.border}` }}
    >
      <CornerResizer isVisible={!!selected} minWidth={160} minHeight={120} onResize={handleResize} />
      <Handle type="target" position={Position.Left} id="table-in" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />
      <Handle type="source" position={Position.Right} id="matrix-out" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />

      <div className="table-drag-handle flex shrink-0 cursor-grab items-center justify-between gap-1 border-b px-2 py-1 active:cursor-grabbing" style={{ borderColor: resolved.border }}>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <GripHorizontal className="size-3.5 shrink-0 opacity-50" style={{ color: resolved.text }} />
          <span className="truncate text-[11px] font-medium opacity-80" style={{ color: resolved.text }}>
            {data.label || safeT(t, "nodes.matrixNode", "Matrix")} ({rows.length}×{colCount})
          </span>
        </div>
        {selected && !upstream && (
          <div className="nodrag flex shrink-0 items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.addRow", "Add row")} onClick={addRow}>
              <Rows3 className="size-3" /><Plus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.removeRow", "Remove row")} onClick={removeRow} disabled={ownRows.length <= 1}>
              <Rows3 className="size-3" /><Minus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.addColumn", "Add column")} onClick={addColumn}>
              <Columns3 className="size-3" /><Plus className="-ms-1 size-2.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.removeColumn", "Remove column")} onClick={removeColumn} disabled={colCount <= 1}>
              <Columns3 className="size-3" /><Minus className="-ms-1 size-2.5" />
            </Button>
          </div>
        )}
      </div>

      {upstream && (
        <p className="nodrag border-b px-2 py-1 text-[10px] opacity-70" style={{ borderColor: resolved.border, color: resolved.text }}>
          Mirroring &ldquo;{upstream.data.label}&rdquo;
        </p>
      )}

      {nonNumericCellCount > 0 && (
        <p className="nodrag border-b border-amber-400/60 bg-amber-400/10 px-2 py-1 text-[10px] leading-snug text-amber-700 dark:text-amber-400">
          ⚠ {nonNumericCellCount} cell{nonNumericCellCount > 1 ? "s" : ""} in &ldquo;{upstream?.data.label}&rdquo; {nonNumericCellCount > 1 ? "aren't" : "isn't"} a number — treated as 0.
        </p>
      )}

      {upstreamIsEmpty ? (
        <p className="nodrag flex flex-1 items-center justify-center px-3 text-center text-xs opacity-60" style={{ color: resolved.text }}>
          &ldquo;{upstream?.data.label}&rdquo; has no data rows to mirror (only a header, or empty).
        </p>
      ) : (
      <div className="nodrag grid flex-1 overflow-auto" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(48px, 1fr))` }} onPaste={handlePaste}>
        {rows.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              value={cell}
              readOnly={!!upstream}
              onChange={(e) => setCell(r, c, toNumberCell(e.target.value))}
              onFocus={() => { activeCellRef.current = { r, c }; }}
              dir="ltr"
              className={cn(
                "min-w-0 border-b border-e px-2 py-1.5 text-center text-xs outline-none focus:bg-primary/5",
                r === rows.length - 1 && "border-b-0",
                c === colCount - 1 && "border-e-0",
              )}
              style={{ borderColor: resolved.border, color: resolved.text }}
            />
          )),
        )}
      </div>
      )}
    </div>
  );
}

const DEFAULT_CHART_ROWS: string[][] = [
  ["", "Series A", "Series B"],
  ["Jan", "10", "18"],
  ["Feb", "14", "12"],
  ["Mar", "9", "20"],
];

/**
 * Renders a bar/line chart (via recharts) from either its own small editable
 * data grid, or — far more usefully — whatever's fed in from an upstream
 * Table/Excel/Matrix node, so editing the source data updates the chart live.
 */
function ChartNode({ id, selected, data }: DiagramNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);
  const t = useTranslations("Flow");
  const resolved = resolveNodeColors(data, colorMode);
  const selectedStroke = colorMode === "dark" ? "#818cf8" : "#6366f1";
  const fallback = SHAPE_DEFAULT_SIZE.chartNode;
  const width = data.width ?? fallback.width;
  const height = data.height ?? fallback.height;
  const chartType = data.chartType ?? "bar";
  const activeCellRef = React.useRef({ r: 0, c: 0 });

  const upstream = useUpstreamTabularNode(id);
  const upstreamGrid = tabularGridOf(upstream);
  const isMatrixUpstream = upstream?.type === "matrixNode";
  const ownRows = data.chartRows && data.chartRows.length > 1 ? data.chartRows : DEFAULT_CHART_ROWS;

  // A Matrix has no header row of series names (it's numbers all the way
  // down) — so unlike Table/Excel, synthesize "Col 1/2/3" series names and
  // "Row 1/2/3" category labels instead of misreading actual data values as
  // if they were column headers.
  let seriesNames: string[];
  let dataRows: string[][];
  if (upstream && isMatrixUpstream) {
    const grid = upstreamGrid ?? [];
    const cols = grid[0]?.length ?? 0;
    seriesNames = Array.from({ length: cols }, (_, i) => `Col ${i + 1}`);
    dataRows = grid.map((row, i) => [`Row ${i + 1}`, ...row]);
  } else {
    const rows = upstream ? (upstreamGrid ?? DEFAULT_CHART_ROWS) : ownRows;
    // First row = series names (skipping the empty corner cell); every row
    // after that = one category (its first cell) plus one number per series.
    seriesNames = rows[0]?.slice(1) ?? [];
    dataRows = rows.slice(1);
  }

  const chartData = dataRows.map((row) => {
    const point: Record<string, string | number> = { name: row[0] ?? "" };
    seriesNames.forEach((series, i) => { point[series] = toNumberCell(row[i + 1] ?? "0"); });
    return point;
  });
  const seriesColors = ["#6366f1", "#f59e0b", "#22c55e", "#ec4899", "#06b6d4"];

  // Explicit, stable pixel size for the chart itself — computed from this
  // node's own width/height (which only change on a deliberate resize drag),
  // instead of a percentage-based ResponsiveContainer. ResponsiveContainer
  // watches its parent via ResizeObserver and re-measures on every render;
  // inside a React Flow custom node that's also being measured/resized by
  // React Flow itself, that turned into a measure → re-render → re-measure
  // loop (the "Maximum update depth exceeded" crash).
  const HEADER_H = 29;
  const EDITOR_H = !upstream && data.chartShowEditor ? 96 : 0;
  const CHART_PADDING = 16;
  const chartAreaWidth = Math.max(160, width - CHART_PADDING);
  const chartAreaHeight = Math.max(120, height - HEADER_H - EDITOR_H - CHART_PADDING);

  const setOwnCell = (r: number, c: number, value: string) => {
    const next = ownRows.map((row) => [...row]);
    next[r][c] = value;
    updateNodeData(id, { chartRows: next });
  };
  const addOwnRow = () => updateNodeData(id, { chartRows: [...ownRows.map((r) => [...r]), Array(ownRows[0]?.length ?? 2).fill("")] });
  const removeOwnRow = () => ownRows.length > 2 && updateNodeData(id, { chartRows: ownRows.slice(0, -1).map((r) => [...r]) });
  const addOwnColumn = () => updateNodeData(id, { chartRows: ownRows.map((r) => [...r, ""]) });
  const removeOwnColumn = () => (ownRows[0]?.length ?? 0) > 2 && updateNodeData(id, { chartRows: ownRows.map((r) => r.slice(0, -1)) });
  const handleOwnPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    e.preventDefault();
    const incoming = parseDelimitedText(text);
    const { r, c } = activeCellRef.current;
    updateNodeData(id, { chartRows: pasteIntoGrid(ownRows, incoming, r, c) });
  };

  const handleResize = useCallback<OnResize>(
    (_e, params) => updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) }),
    [id, updateNodeData],
  );

  const helpText = safeT(
    t,
    "settings.chartHelp",
    'How to fill this in: the top-left cell stays empty; the rest of the first row is your series names (e.g. "Revenue", "Cost"). Every row below that starts with a category label (e.g. "Jan") followed by one number per series. You can type directly, paste a range copied from Excel/Sheets, or connect a Table/Excel/Matrix node instead of entering data here.',
  );

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg shadow-sm"
      style={{ width, minWidth: 240, height, backgroundColor: resolved.background, border: `1.5px solid ${selected ? selectedStroke : resolved.border}` }}
    >
      <CornerResizer isVisible={!!selected} minWidth={240} minHeight={180} onResize={handleResize} />
      <Handle type="target" position={Position.Left} id="table-in" className="h-2.5! w-2.5! border-2! border-white! bg-slate-400! relative after:absolute after:-inset-2 after:content-['']" />

      <div className="table-drag-handle flex shrink-0 cursor-grab items-center justify-between gap-1 border-b px-2 py-1 active:cursor-grabbing" style={{ borderColor: resolved.border }}>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <GripHorizontal className="size-3.5 shrink-0 opacity-50" style={{ color: resolved.text }} />
          <span className="truncate text-[11px] font-medium opacity-80" style={{ color: resolved.text }}>
            {data.label || safeT(t, "nodes.chartNode", "Chart")}
          </span>
        </div>
        {selected && (
          <div className="nodrag flex shrink-0 items-center gap-0.5">
            <Button variant={chartType === "bar" ? "secondary" : "ghost"} size="icon-sm" className="size-6 text-[10px]" onClick={() => updateNodeData(id, { chartType: "bar" })}>
              Bar
            </Button>
            <Button variant={chartType === "line" ? "secondary" : "ghost"} size="icon-sm" className="size-6 text-[10px]" onClick={() => updateNodeData(id, { chartType: "line" })}>
              Line
            </Button>
            {!upstream && (
              <Button variant={data.chartShowEditor ? "secondary" : "ghost"} size="icon-sm" className="size-6" title={safeT(t, "settings.editChartData", "Edit data")} onClick={() => updateNodeData(id, { chartShowEditor: !data.chartShowEditor })}>
                <Table className="size-3" />
              </Button>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-6" title={safeT(t, "settings.chartHelpTitle", "How do I enter data?")}>
                  <HelpCircle className="size-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 text-xs leading-relaxed">
                {helpText}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Inline data editor — only relevant (and only shown) when nothing is
          connected upstream, since a connected Table/Excel/Matrix node is
          already the source of truth and this would just be a confusing
          second place to edit the same thing. */}
      {!upstream && data.chartShowEditor && (
        <div className="nodrag flex shrink-0 items-center justify-between gap-1 border-b px-2 py-1" style={{ borderColor: resolved.border }}>
          <div
            className="grid flex-1 gap-px overflow-x-auto"
            style={{ gridTemplateColumns: `repeat(${ownRows[0]?.length ?? 0}, minmax(52px, 1fr))` }}
            onPaste={handleOwnPaste}
          >
            {ownRows.map((row, r) =>
              row.map((cell, c) => (
                <input
                  key={`${r}-${c}`}
                  value={cell}
                  onChange={(e) => setOwnCell(r, c, e.target.value)}
                  onFocus={() => { activeCellRef.current = { r, c }; }}
                  placeholder={r === 0 && c === 0 ? "—" : undefined}
                  className={cn(
                    "min-w-0 rounded border px-1 py-0.5 text-[10px] outline-none focus:bg-primary/5",
                    r === 0 && "font-semibold",
                  )}
                  style={{ borderColor: resolved.border, color: resolved.text }}
                />
              )),
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-0.5">
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon-sm" className="size-5" title={safeT(t, "settings.addRow", "Add row")} onClick={addOwnRow}><Plus className="size-2.5" /></Button>
              <Button variant="ghost" size="icon-sm" className="size-5" title={safeT(t, "settings.removeRow", "Remove row")} onClick={removeOwnRow}><Minus className="size-2.5" /></Button>
            </div>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon-sm" className="size-5" title={safeT(t, "settings.addColumn", "Add column")} onClick={addOwnColumn}><Columns3 className="size-2.5" /></Button>
              <Button variant="ghost" size="icon-sm" className="size-5" title={safeT(t, "settings.removeColumn", "Remove column")} onClick={removeOwnColumn}><Columns3 className="size-2.5" /></Button>
            </div>
          </div>
        </div>
      )}

      <div className="nodrag min-h-0 flex-1 overflow-hidden p-2">
        {chartData.length === 0 || seriesNames.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
            <p className="text-xs opacity-60" style={{ color: resolved.text }}>
              {upstream
                ? `⚠ "${upstream.data.label}" doesn't have enough rows/columns to chart — need at least one category row and one series column.`
                : "No data yet."}
            </p>
            {!upstream && (
              <Button variant="outline" size="sm" className="nodrag h-7 gap-1 text-[11px]" onClick={() => updateNodeData(id, { chartShowEditor: true })}>
                <Table className="size-3" /> {safeT(t, "settings.editChartData", "Edit data")}
              </Button>
            )}
          </div>
        ) : chartType === "bar" ? (
          <BarChart width={chartAreaWidth} height={chartAreaHeight} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <RechartsTooltip />
            {seriesNames.map((series, i) => (
              <Bar key={`${series}-${i}`} dataKey={series} fill={seriesColors[i % seriesColors.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <LineChart width={chartAreaWidth} height={chartAreaHeight} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <RechartsTooltip />
            {seriesNames.map((series, i) => (
              <Line key={`${series}-${i}`} type="monotone" dataKey={series} stroke={seriesColors[i % seriesColors.length]} strokeWidth={2} dot={{ r: 2 }} />
            ))}
          </LineChart>
        )}
      </div>
    </div>
  );
}

// ─── nodeTypes registry ─────────────────────────────────────────────────────
// Keys match DiagramNodeType exactly; `satisfies` validates the shape without
// widening to React Flow's generic NodeTypes.

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
  triangleNode: TriangleNode,
  cloudNode: CloudNode,
  documentNode: DocumentNode,
  predefinedProcessNode: PredefinedProcessNode,
  delayNode: DelayNode,
  groupNode: GroupNode,
  numberNode: NumberNode,
  operatorNode: OperatorNode,
  constantNode: ConstantNode,
  tableNode: TableNode,
  excelNode: ExcelNode,
  matrixNode: MatrixNode,
  chartNode: ChartNode,
  geometryCalcNode: GeometryCalcNode,
  beamCalcNode: BeamCalcNode,
  shapeNode: ShapeNode,
  imageNode: ImageNode,
  svgNode: ImageNode,
} satisfies Record<DiagramNodeType, React.ComponentType<DiagramNodeProps>>;

/** Node types that should only be draggable by a header/handle, not the whole body. */
export const DRAG_HANDLE_BY_TYPE: Partial<Record<DiagramNodeType, string>> = {
  groupNode: ".subflow-drag-handle",
  tableNode: ".table-drag-handle",
  excelNode: ".table-drag-handle",
  matrixNode: ".table-drag-handle",
  chartNode: ".table-drag-handle",
};



