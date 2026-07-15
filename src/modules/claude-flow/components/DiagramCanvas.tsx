"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ConnectionMode,
  SelectionMode,
  useReactFlow,
  type Edge,
  type Node,
  type OnConnectStart,
  type OnConnectEnd,
  type OnNodeDrag,
  type IsValidConnection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTranslations } from "next-intl";
import { Square, Diamond, Flag, Layers, X } from "lucide-react";

import { useDiagramStore } from "../store";
import { nodeTypes, DRAG_HANDLE_BY_TYPE } from "./nodes/BaseNode";
import { edgeTypes } from "./edges/CustomEdge";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import { SHAPE_DEFAULT_SIZE } from "../utils/shapes";
import { resolveNodeColors } from "../utils/colors";
import { makeIsValidConnection } from "../utils/validation";
import type { DiagramNodeData, DiagramNodeType, PaletteItem } from "../types";

const BG_VARIANT_MAP: Record<string, BackgroundVariant | null> = {
  dots: BackgroundVariant.Dots,
  lines: BackgroundVariant.Lines,
  cross: BackgroundVariant.Cross,
  none: null,
};

let nodeIdCounter = 0;
const generateNodeId = () => `node-${Date.now()}-${nodeIdCounter++}`;

// Absolute (viewport-space) position of a node, accounting for one level of subflow nesting.
function absolutePosition(node: Node<DiagramNodeData>, allNodes: Node<DiagramNodeData>[]) {
  if (!node.parentId) return node.position;
  const parent = allNodes.find((n) => n.id === node.parentId);
  if (!parent) return node.position;
  return { x: node.position.x + parent.position.x, y: node.position.y + parent.position.y };
}

function nodeDims(node: Node<DiagramNodeData>) {
  const fallback = SHAPE_DEFAULT_SIZE[(node.type ?? "defaultNode") as DiagramNodeType] ?? SHAPE_DEFAULT_SIZE.defaultNode;
  return { width: node.data?.width ?? fallback.width, height: node.data?.height ?? fallback.height };
}

/** Standard ray-casting point-in-polygon test. */
function pointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function nodeCorners(node: Node<DiagramNodeData>, allNodes: Node<DiagramNodeData>[]) {
  const abs = absolutePosition(node, allNodes);
  const { width, height } = nodeDims(node);
  return [
    { x: abs.x, y: abs.y },
    { x: abs.x + width, y: abs.y },
    { x: abs.x + width, y: abs.y + height },
    { x: abs.x, y: abs.y + height },
  ];
}

/** "Partial" lasso mode: selects a node if the lasso touches ANY part of it (any corner, or its center). */
function isPartiallyInLasso(node: Node<DiagramNodeData>, allNodes: Node<DiagramNodeData>[], polygon: { x: number; y: number }[]) {
  const corners = nodeCorners(node, allNodes);
  const cx = (corners[0].x + corners[2].x) / 2;
  const cy = (corners[0].y + corners[2].y) / 2;
  return pointInPolygon({ x: cx, y: cy }, polygon) || corners.some((c) => pointInPolygon(c, polygon));
}

/** "Full" lasso mode: only selects a node if it's ENTIRELY enclosed by the lasso. */
function isFullyInLasso(node: Node<DiagramNodeData>, allNodes: Node<DiagramNodeData>[], polygon: { x: number; y: number }[]) {
  return nodeCorners(node, allNodes).every((c) => pointInPolygon(c, polygon));
}

// Small set of node types offered by the "add node on edge drop" quick menu —
// kept short on purpose so the popup stays scannable.
const QUICK_ADD_ITEMS: { type: DiagramNodeType; icon: React.ComponentType<{ className?: string }>; label: string; defaultData: Partial<DiagramNodeData> }[] = [
  { type: "defaultNode", icon: Square, label: "Process", defaultData: { label: "Process" } },
  { type: "diamondNode", icon: Diamond, label: "Decision", defaultData: { label: "Decision", colorToken: "amber" } },
  { type: "outputNode", icon: Flag, label: "End", defaultData: { label: "End", colorToken: "red" } },
  { type: "groupNode", icon: Layers, label: "Sub-flow", defaultData: { label: "Sub-flow", colorToken: "neutral" } },
];

interface QuickAddState {
  screenX: number;
  screenY: number;
  sourceId: string;
  sourceHandleId: string | null;
}

/** Popup shown when a connection is dragged from a handle and dropped on empty canvas
 *  (reactflow "Add Node On Edge Drop" pattern) — pick a type to create + auto-connect it. */
function QuickAddMenu({ state, onPick, onClose }: { state: QuickAddState; onPick: (item: (typeof QUICK_ADD_ITEMS)[number]) => void; onClose: () => void }) {
  return (
    <div
      data-quick-add-menu
      style={{ top: state.screenY, left: state.screenX }}
      className="fixed z-50 w-40 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-1.5 pb-1 pt-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Add node</span>
        <button onClick={onClose} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="size-3" />
        </button>
      </div>
      {QUICK_ADD_ITEMS.map((item) => (
        <button
          key={item.type}
          onClick={() => onPick(item)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-xs text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <item.icon className="size-3.5 shrink-0" />
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Theming (https://reactflow.dev/learn/customization/theming) ───────────
// A handful of targeted overrides on top of React Flow's own colorMode
// theme: our indigo selection accent, and green/red handle feedback while
// dragging a connection (https://reactflow.dev/examples/interaction/validation).
// Scoped under .cf-theme so it can never leak outside this component.
const THEME_CSS = `
.cf-theme .react-flow {
  --xy-selection-background-color-default: rgba(99,102,241,0.08);
  --xy-selection-border-default: 1px solid #6366f1;
  --xy-connectionline-stroke-default: #6366f1;
  --xy-connectionline-stroke-width-default: 2px;
}
.cf-theme .react-flow.dark {
  --xy-connectionline-stroke-default: #818cf8;
}
/* Toolbar's "hide/show all handles" toggle — one global CSS switch instead of
   touching every node's own data, so it's instant and can't fall out of sync. */
.cf-theme.hide-all-handles .react-flow__handle {
  opacity: 0;
  pointer-events: none;
}
.cf-theme .react-flow__handle.valid {
  background-color: #22c55e !important;
  border-color: #16a34a !important;
}
.cf-theme .react-flow__handle.invalid {
  background-color: #ef4444 !important;
  border-color: #dc2626 !important;
}
.cf-theme .react-flow__edge-path {
  transition: stroke 0.15s ease;
}
`;

export function DiagramCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Flow");
  const { screenToFlowPosition, flowToScreenPosition, fitView } = useReactFlow();

  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const onNodesChange = useDiagramStore((s) => s.onNodesChange);
  const onEdgesChange = useDiagramStore((s) => s.onEdgesChange);
  const onConnect = useDiagramStore((s) => s.onConnect);
  const addNode = useDiagramStore((s) => s.addNode);
  const setSelectedNode = useDiagramStore((s) => s.setSelectedNode);
  const setSelectedEdge = useDiagramStore((s) => s.setSelectedEdge);
  const deleteSelected = useDiagramStore((s) => s.deleteSelected);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);
  const copy = useDiagramStore((s) => s.copy);
  const paste = useDiagramStore((s) => s.paste);
  const clipboard = useDiagramStore((s) => s.clipboard);
  const settings = useDiagramStore((s) => s.settings);
  const reparentNode = useDiagramStore((s) => s.reparentNode);
  const groupSelectedNodes = useDiagramStore((s) => s.groupSelectedNodes);
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectionTool = useDiagramStore((s) => s.selectionTool);
  const isCanvasLocked = useDiagramStore((s) => s.isCanvasLocked);
  const globalHideHandles = useDiagramStore((s) => s.globalHideHandles);
  const setIsCanvasFullscreen = useDiagramStore((s) => s.setIsCanvasFullscreen);
  const setCanvasFullscreenToggle = useDiagramStore((s) => s.setCanvasFullscreenToggle);

  // Real Fullscreen API on THIS wrapper only (canvas area, not the toolbar or
  // side panels) — the Toolbar can't reach `wrapperRef` directly since it's a
  // sibling, not a descendant, so it registers a callback into the store
  // instead and the Toolbar's button just calls that.
  useEffect(() => {
    const toggle = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        wrapperRef.current?.requestFullscreen().catch(() => {});
      }
    };
    setCanvasFullscreenToggle(toggle);

    const onFullscreenChange = () => {
      setIsCanvasFullscreen(document.fullscreenElement === wrapperRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      setCanvasFullscreenToggle(null);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [setCanvasFullscreenToggle, setIsCanvasFullscreen]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null);
  // Which group node the currently-dragged node is hovering over — drives the
  // "drop here" highlight without touching the store on every mousemove.
  const [hoverGroupId, setHoverGroupId] = useState<string | null>(null);

  //── Drag & drop from the palette ─────────────────────────────────────────

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/diagram-node");
      if (!raw) return;

      const item: PaletteItem = JSON.parse(raw);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // next-intl throws on missing keys in dev; fall back gracefully
      let label: string;
      try {
        label = t(`nodes.${item.labelKey}`);
      } catch {
        label = item.defaultData.label ?? "Node";
      }

      const newNode: Node<DiagramNodeData> = {
        id: generateNodeId(),
        type: item.type,
        position,
        dragHandle: DRAG_HANDLE_BY_TYPE[item.type],
        data: { label, ...item.defaultData },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode, t],
  );

  // ── Subflow: drop a node onto/off a group to reparent it ────────────────

  const onNodeDrag = useCallback<OnNodeDrag>((_event, draggedNode) => {
    if (draggedNode.type === "groupNode") {
      setHoverGroupId(null);
      return;
    }
    const allNodes = useDiagramStore.getState().nodes;
    const abs = absolutePosition(draggedNode as Node<DiagramNodeData>, allNodes);
    const { width, height } = nodeDims(draggedNode as Node<DiagramNodeData>);
    const centerX = abs.x + width / 2;
    const centerY = abs.y + height / 2;

    const hit = allNodes.find((n) => {
      if (n.type !== "groupNode" || n.id === draggedNode.id) return false;
      const { width: gw, height: gh } = nodeDims(n);
      return centerX > n.position.x && centerX < n.position.x + gw && centerY > n.position.y && centerY < n.position.y + gh;
    });
    setHoverGroupId(hit?.id ?? null);

    // Node collisions (https://reactflow.dev/examples/layout/node-collisions):
    // shove any top-level sibling the dragged node overlaps out of the way,
    // along whichever axis has the smaller overlap (a standard minimum-
    // translation-vector resolution — feels like the nodes are physically
    // bumping into each other rather than passing through).
    if (useDiagramStore.getState().settings.collisionAvoidance) {
      const dLeft = abs.x;
      const dTop = abs.y;
      const dRight = abs.x + width;
      const dBottom = abs.y + height;
      const pushes = new Map<string, { x: number; y: number }>();

      allNodes.forEach((n) => {
        if (n.id === draggedNode.id || n.type === "groupNode" || n.parentId) return;
        const { width: nw, height: nh } = nodeDims(n);
        const nLeft = n.position.x;
        const nTop = n.position.y;
        const nRight = nLeft + nw;
        const nBottom = nTop + nh;

        const overlapX = Math.min(dRight, nRight) - Math.max(dLeft, nLeft);
        const overlapY = Math.min(dBottom, nBottom) - Math.max(dTop, nTop);
        if (overlapX <= 0 || overlapY <= 0) return;

        let dx = 0;
        let dy = 0;
        if (overlapX < overlapY) {
          dx = nLeft + nw / 2 < centerX ? -overlapX : overlapX;
        } else {
          dy = nTop + nh / 2 < centerY ? -overlapY : overlapY;
        }
        pushes.set(n.id, { x: nLeft + dx, y: nTop + dy });
      });

      if (pushes.size > 0) {
        useDiagramStore.setState((s) => ({
          nodes: s.nodes.map((n) => {
            const p = pushes.get(n.id);
            return p ? { ...n, position: p } : n;
          }),
        }));
      }
    }
  }, []);

  const onNodeDragStop = useCallback<OnNodeDrag>(
    (_event, draggedNode) => {
      setHoverGroupId(null);
      if (draggedNode.type === "groupNode") return; // v1: no nesting groups inside groups

      const typedNode = draggedNode as Node<DiagramNodeData>;
      const allNodes = useDiagramStore.getState().nodes;
      const abs = absolutePosition(typedNode, allNodes);
      const { width, height } = nodeDims(typedNode);
      const centerX = abs.x + width / 2;
      const centerY = abs.y + height / 2;

      const hit = allNodes.find((n) => {
        if (n.type !== "groupNode" || n.id === typedNode.id) return false;
        const { width: gw, height: gh } = nodeDims(n);
        return centerX > n.position.x && centerX < n.position.x + gw && centerY > n.position.y && centerY < n.position.y + gh;
      });

      if (hit && typedNode.parentId !== hit.id) {
        reparentNode(typedNode.id, hit.id);
      } else if (!hit && typedNode.parentId) {
        reparentNode(typedNode.id, null);
      }
    },
    [reparentNode],
  );

  // ── Click handlers ────────────────────────────────────────────────────

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setQuickAdd(null);
    },
    [setSelectedNode],
  );
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
      setQuickAdd(null);
    },
    [setSelectedEdge],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setQuickAdd(null);
    // Explicitly clear any lingering multi-select flags too. Don't rely on
    // React Flow's own pane-click deselection alone — this is what caused
    // the settings panel to sometimes fail to auto-close: selectedNodeId
    // went back to null, but a still-`selected: true` node (or edge) from a
    // previous box/lasso selection kept hasSelection() true in DiagramEditor,
    // and group-selected edges specifically stayed highlighted forever since
    // only nodes were being cleared here.
    useDiagramStore.setState((s) => {
      const hasSelectedNode = s.nodes.some((n) => n.selected);
      const hasSelectedEdge = s.edges.some((e) => e.selected);
      if (!hasSelectedNode && !hasSelectedEdge) return s;
      return {
        nodes: hasSelectedNode ? s.nodes.map((n) => (n.selected ? { ...n, selected: false } : n)) : s.nodes,
        edges: hasSelectedEdge ? s.edges.map((e) => (e.selected ? { ...e, selected: false } : e)) : s.edges,
      };
    });
  }, [setSelectedNode, setSelectedEdge]);

  // ── Context menu handlers ─────────────────────────────────────────────

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setSelectedNode(node.id);
      setContextMenu({ x: event.clientX, y: event.clientY, target: "node" });
    },
    [setSelectedNode],
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setSelectedEdge(edge.id);
      setContextMenu({ x: event.clientX, y: event.clientY, target: "edge" });
    },
    [setSelectedEdge],
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    const { clientX, clientY } = event as MouseEvent;
    setContextMenu({ x: clientX, y: clientY, target: "pane" });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  // Quick-add popup: dismiss on ANY click outside it (not just clicks React
  // Flow itself reports, like onPaneClick — this also covers clicking the
  // toolbar, palette, or settings panel while the popup is open).
  useEffect(() => {
    if (!quickAdd) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-quick-add-menu]")) setQuickAdd(null);
    };
    // Capture phase so this runs even if something downstream stops propagation.
    document.addEventListener("mousedown", handleOutsideClick, true);
    return () => document.removeEventListener("mousedown", handleOutsideClick, true);
  }, [quickAdd]);

  // ── Select-all — proper useCallback, not inline setState ─────────────────

  const onSelectAll = useCallback(() => {
    useDiagramStore.setState((s) => ({ nodes: s.nodes.map((n) => ({ ...n, selected: true })) }));
  }, []);

  // ── Connection validation (https://reactflow.dev/examples/interaction/validation
  //     + https://reactflow.dev/examples/nodes/connection-limit) ───────────
  // No self-loops, no exact duplicate edges, and a 1-connection cap per
  // target handle. React Flow shows this live via .valid/.invalid classes on
  // the handle being targeted while dragging (styled in THEME_CSS above).
  const isValidConnection = useCallback<IsValidConnection>(
    makeIsValidConnection(() => useDiagramStore.getState()),
    [],
  );

  // ── Add-node-on-edge-drop ─────────────────────────────────────────────
  // Track which handle a connection started from; if it's released over empty
  // canvas (the pane), offer a quick menu to create + auto-connect a node there.

  const connectingHandle = useRef<{ nodeId: string; handleId: string | null } | null>(null);

  const onConnectStart = useCallback<OnConnectStart>((_event, params) => {
    connectingHandle.current = params.nodeId ? { nodeId: params.nodeId, handleId: params.handleId } : null;
  }, []);

  const onConnectEnd = useCallback<OnConnectEnd>((event, connectionState) => {
    const info = connectingHandle.current;
    connectingHandle.current = null;
    if (!info) return;

    // Only offer the quick-add menu when the drag genuinely did NOT land on a
    // valid handle/node (connectionState.isValid is React Flow's own source of
    // truth here — far more reliable than checking event.target's DOM class,
    // which can be wrong with connectionRadius/"easy connect" loose mode).
    if (connectionState?.isValid) return;

    const point = "changedTouches" in event ? event.changedTouches[0] : (event as MouseEvent);
    setQuickAdd({
      screenX: point.clientX,
      screenY: point.clientY,
      sourceId: info.nodeId,
      sourceHandleId: info.handleId,
    });
  }, []);

  const handleQuickAddPick = useCallback(
    (item: (typeof QUICK_ADD_ITEMS)[number]) => {
      if (!quickAdd) return;
      const position = screenToFlowPosition({ x: quickAdd.screenX, y: quickAdd.screenY });
      const newId = generateNodeId();
      const newNode: Node<DiagramNodeData> = {
        id: newId,
        type: item.type,
        position,
        dragHandle: DRAG_HANDLE_BY_TYPE[item.type],
        data: { label: item.defaultData.label ?? "Node", ...item.defaultData },
      };
      addNode(newNode);
      useDiagramStore.getState().onConnect({
        source: quickAdd.sourceId,
        sourceHandle: quickAdd.sourceHandleId,
        target: newId,
        targetHandle: null,
      });
      setQuickAdd(null);
    },
    [quickAdd, screenToFlowPosition, addNode],
  );

  // ── Lasso selection (https://reactflow.dev/examples/whiteboard/lasso-selection) ──
  // A freeform alternative to React Flow's built-in rectangle marquee (used
  // when selectionTool === "box", wired further down via <ReactFlow> props).
  //
  // IMPLEMENTATION NOTE: this used to try to intercept mouse events via
  // capture-phase listeners on an ancestor wrapper div — unreliable, because
  // it depends on winning a race against React Flow's own internal pan/zoom
  // event handling, which isn't guaranteed. The robust fix is a plain,
  // ordinary <div> rendered ON TOP of the ReactFlow canvas (higher z-index)
  // that becomes pointer-events:auto only while the lasso tool is active. A
  // topmost element always receives the browser's hit-test first — no
  // capture-phase races, no stopPropagation guessing.
  const [lassoScreenPoints, setLassoScreenPoints] = useState<{ x: number; y: number }[] | null>(null);
  const lassoActive = useRef(false);
  const lassoPointsRef = useRef<{ x: number; y: number }[] | null>(null);
  const lassoOverlayRef = useRef<HTMLDivElement>(null);
  const lassoMode = useDiagramStore((s) => s.lassoMode);

  const onLassoMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0 || !lassoOverlayRef.current) return;
    const rect = lassoOverlayRef.current.getBoundingClientRect();
    lassoActive.current = true;
    const start = [{ x: event.clientX - rect.left, y: event.clientY - rect.top }];
    lassoPointsRef.current = start;
    setLassoScreenPoints(start);
  }, []);

  const onLassoMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const dragState = dragBoxState.current;
      if (dragState) {
        // Convert the screen-space mouse delta to flow space (accounts for
        // zoom/pan automatically, since both points go through the same transform).
        const startFlow = screenToFlowPosition({ x: dragState.startClientX, y: dragState.startClientY });
        const currentFlow = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const dx = currentFlow.x - startFlow.x;
        const dy = currentFlow.y - startFlow.y;
        useDiagramStore.setState((s) => ({
          nodes: s.nodes.map((n) => {
            const start = dragState.positions.get(n.id);
            if (!start) return n;
            return { ...n, position: { x: start.x + dx, y: start.y + dy } };
          }),
        }));
        return;
      }

      if (!lassoActive.current || !lassoPointsRef.current || !lassoOverlayRef.current) return;
      const rect = lassoOverlayRef.current.getBoundingClientRect();
      const next = [...lassoPointsRef.current, { x: event.clientX - rect.left, y: event.clientY - rect.top }];
      lassoPointsRef.current = next;
      setLassoScreenPoints(next);
    },
    [screenToFlowPosition],
  );

  const onLassoMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (dragBoxState.current) {
        dragBoxState.current = null;
        useDiagramStore.getState().pushHistory();
        return;
      }

      if (!lassoActive.current || !lassoOverlayRef.current) return;
      lassoActive.current = false;
      const rect = lassoOverlayRef.current.getBoundingClientRect();
      const pts = lassoPointsRef.current;
      lassoPointsRef.current = null;
      setLassoScreenPoints(null);

      // Always include the final release point, even if mousemove fired
      // sparsely (e.g. a fast, short drag) — guarantees a valid polygon.
      const finalPts = pts ? [...pts, { x: event.clientX - rect.left, y: event.clientY - rect.top }] : pts;
      if (!finalPts || finalPts.length < 3) return;

      const flowPolygon = finalPts.map((p) => screenToFlowPosition({ x: p.x + rect.left, y: p.y + rect.top }));
      const allNodes = useDiagramStore.getState().nodes;
      const test = lassoMode === "full" ? isFullyInLasso : isPartiallyInLasso;
      const selectedIds = new Set(allNodes.filter((n) => test(n, allNodes, flowPolygon)).map((n) => n.id));

      // Plain side-effect call, outside any React state updater — safe.
      useDiagramStore.setState((s) => ({ nodes: s.nodes.map((n) => ({ ...n, selected: selectedIds.has(n.id) })) }));
    },
    [screenToFlowPosition, lassoMode],
  );

  // ── Drag-box for lasso-selected nodes ────────────────────────────────
  // React Flow's native box-select automatically shows a bounding rect you
  // can drag to move every selected node together — since our lasso bypasses
  // React Flow's own selection mechanism, that affordance doesn't come for
  // free, so it's rebuilt here: once 2+ nodes are lasso-selected, a matching
  // draggable frame appears around them.
  const dragBoxState = useRef<{
    startClientX: number;
    startClientY: number;
    positions: Map<string, { x: number; y: number }>;
  } | null>(null);

  const multiSelectedNodes = nodes.filter((n) => n.selected);
  const showDragBox = selectionTool === "lasso" && multiSelectedNodes.length > 1 && !lassoScreenPoints;

  let dragBoxRect: { left: number; top: number; width: number; height: number } | null = null;
  if (showDragBox && lassoOverlayRef.current) {
    const rect = lassoOverlayRef.current.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    multiSelectedNodes.forEach((n) => {
      const abs = absolutePosition(n, nodes);
      const { width, height } = nodeDims(n);
      minX = Math.min(minX, abs.x);
      minY = Math.min(minY, abs.y);
      maxX = Math.max(maxX, abs.x + width);
      maxY = Math.max(maxY, abs.y + height);
    });
    const topLeft = flowToScreenPosition({ x: minX, y: minY });
    const bottomRight = flowToScreenPosition({ x: maxX, y: maxY });
    const PAD = 8;
    dragBoxRect = {
      left: topLeft.x - rect.left - PAD,
      top: topLeft.y - rect.top - PAD,
      width: bottomRight.x - topLeft.x + PAD * 2,
      height: bottomRight.y - topLeft.y + PAD * 2,
    };
  }

  const onDragBoxMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return;
    // Stops the lasso overlay's own onMouseDown from also firing and
    // starting a brand-new lasso draw on top of the existing selection.
    event.stopPropagation();
    const selected = useDiagramStore.getState().nodes.filter((n) => n.selected);
    dragBoxState.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      positions: new Map(selected.map((n) => [n.id, { ...n.position }])),
    };
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;

      if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (mod && (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey))) {
        event.preventDefault();
        redo();
      } else if (mod && event.key.toLowerCase() === "c") {
        copy();
      } else if (mod && event.key.toLowerCase() === "v") {
        paste();
      } else if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      } else if (mod && event.key.toLowerCase() === "g") {
        event.preventDefault();
        groupSelectedNodes();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        // Avoid deleting while typing in inputs
        const tag = (event.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        deleteSelected();
      }
    },
    [undo, redo, copy, paste, duplicateSelected, deleteSelected, groupSelectedNodes],
  );

  const bgVariant = BG_VARIANT_MAP[settings.backgroundVariant];
  // xyflow's Background `size` prop means different things per variant: for
  // Dots/Lines, 1.2 is a fine dot radius / line thickness. For Cross, `size`
  // is the arm-length of the "+" glyph — at 1.2px it was essentially a few
  // invisible pixels, which is why the "Cross" background option looked like
  // it "didn't work". Matches xyflow's own documented default (6) for Cross.
  const bgSize = settings.backgroundVariant === "cross" ? 6 : 1.2;

  // Highlight whichever group node the user is currently dragging a node over.
  const displayNodes = hoverGroupId
    ? nodes.map((n) => (n.id === hoverGroupId ? { ...n, className: "ring-2 ring-indigo-400 ring-offset-2 rounded-lg" } : n))
    : nodes;

  // Box-select and lasso both reserve the left mouse button on empty canvas
  // for selecting instead of panning — middle/right-drag still pans either way.
  const reservedForSelection = selectionTool !== "pointer";

  return (
    // outline-none prevents the browser focus ring from showing on the canvas wrapper
    <div
      ref={wrapperRef}
      className={cn("cf-theme relative h-full w-full outline-none", globalHideHandles && "hide-all-handles")}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <style>{THEME_CSS}</style>

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        snapToGrid={settings.snapToGrid}
        snapGrid={settings.snapGrid}
        colorMode={settings.colorMode}
        // "Easy connect": loosen connection targeting so a drag can land on
        // any handle (not just matching source/target types) and widen the
        // hit-radius around each handle — see reactflow "Easy Connect" example.
        connectionMode={ConnectionMode.Loose}
        connectionRadius={24}
        // Selection tool (https://reactflow.dev/examples/whiteboard/rectangle):
        // when box or lasso mode is active, the left mouse button is reserved
        // for selecting on empty canvas — pan with the middle/right button instead.
        selectionOnDrag={selectionTool === "box"}
        selectionMode={SelectionMode.Partial}
        panOnDrag={reservedForSelection ? [1, 2] : true}
        // Lock button (Toolbar): view-only — dragging/connecting/selecting
        // nodes is disabled, but panning and zooming the canvas still work.
        nodesDraggable={!isCanvasLocked}
        nodesConnectable={!isCanvasLocked}
        elementsSelectable={!isCanvasLocked}
        fitView
        // Wide zoom range so large diagrams (many nodes) can be zoomed far
        // enough out to see everything at once, and the minimap stays useful.
        minZoom={0.05}
        maxZoom={4}
        defaultEdgeOptions={{ type: settings.defaultEdgeType }}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        {bgVariant !== null && <Background variant={bgVariant} gap={16} size={bgSize} color="#e2e8f0" />}

        {settings.showControls && <Controls position="bottom-right" showInteractive={false} />}

        {settings.showMiniMap && (
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor={(n) => resolveNodeColors(n.data as DiagramNodeData, settings.colorMode).background}
            maskColor="rgba(241, 245, 249, 0.6)"
            className="border! border-slate-200! shadow-sm!"
          />
        )}

        <Panel position="top-center">
          {nodes.length === 0 && (
            <p className="pointer-events-none rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs text-slate-400 shadow-sm backdrop-blur">
              {t("palette.dragToAdd")}
            </p>
          )}
        </Panel>
      </ReactFlow>

      {/* Lasso capture layer — sits ON TOP of the canvas so it always gets the
          browser's hit-test first, no event-race with React Flow's own
          panning/zooming. Only interactive while the lasso tool is selected;
          otherwise pointer-events:none lets everything pass straight through. */}
      <div
        ref={lassoOverlayRef}
        className="absolute inset-0"
        style={{
          zIndex: 30,
          pointerEvents: selectionTool === "lasso" ? "auto" : "none",
          cursor: selectionTool === "lasso" ? "crosshair" : undefined,
        }}
        onMouseDown={onLassoMouseDown}
        onMouseMove={onLassoMouseMove}
        onMouseUp={onLassoMouseUp}
      >
        {lassoScreenPoints && lassoScreenPoints.length > 1 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <polygon
              points={lassoScreenPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="rgba(99,102,241,0.10)"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
          </svg>
        )}

        {/* Draggable frame around a lasso-made multi-selection — move every
            selected node together, the same affordance native box-select gives you. */}
        {dragBoxRect && (
          <div
            onMouseDown={onDragBoxMouseDown}
            className="absolute cursor-move rounded-sm border-2 border-dashed border-indigo-500 bg-indigo-500/5"
            style={{
              left: dragBoxRect.left,
              top: dragBoxRect.top,
              width: dragBoxRect.width,
              height: dragBoxRect.height,
            }}
          />
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={closeContextMenu}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
          onFitView={() => fitView({ duration: 300 })}
          onSelectAll={onSelectAll}
          onPaste={paste}
          canPaste={!!clipboard}
          onGroup={groupSelectedNodes}
          onUngroup={deleteSelected}
          isGroupNode={nodes.find((n) => n.id === selectedNodeId)?.type === "groupNode"}
          quickAddItems={QUICK_ADD_ITEMS}
          onAddNode={(type) => {
            const item = QUICK_ADD_ITEMS.find((qi) => qi.type === type);
            const position = screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });
            addNode({
              id: generateNodeId(),
              type,
              position,
              dragHandle: DRAG_HANDLE_BY_TYPE[type],
              data: { label: item?.defaultData.label ?? "Node", ...item?.defaultData },
            });
            closeContextMenu();
          }}
        />
      )}

      {quickAdd && <QuickAddMenu state={quickAdd} onPick={handleQuickAddPick} onClose={() => setQuickAdd(null)} />}
    </div>
  );
}
