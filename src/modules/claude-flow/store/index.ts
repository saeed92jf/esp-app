'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Viewport,
} from '@xyflow/react';
import type {
  DiagramNodeData,
  DiagramEdgeData,
  DiagramNodeType,
  SavedDiagram,
  EditorSettings,
  HistoryEntry,
  SelectionTool,
  LassoMode,
} from '../types';
import { resolveEdgeColor } from '../utils/colors';
import { SHAPE_DEFAULT_SIZE } from '../utils/shapes';
import { computeGeometry, computeSecondMomentOfArea, isBeamCompatible, validateBeamInputs, toBeamInputs, GEOMETRY_SHAPE_MODES } from '../utils/geometry';
import { MATH_CONSTANTS, MATH_CONSTANT_BY_KEY } from '../utils/constants';
import { OPERATOR_ARITY, evaluateOperator } from '../utils/operators';

const DEFAULT_SETTINGS: EditorSettings = {
  snapToGrid: false,
  snapGrid: [15, 15],
  showMiniMap: true,
  showControls: true,
  backgroundVariant: 'dots',
  colorMode: 'light',
  defaultEdgeType: 'smoothstep',
  autoSave: true,
  collisionAvoidance: true,
};

const MAX_HISTORY = 50;

// ── Subflow helpers ─────────────────────────────────────────────────────
// React Flow requires that a parent node appears before its children in the
// nodes array. This topological sort keeps everything else in its original
// relative order and is safe to call repeatedly (idempotent).
function sortNodesParentFirst<T extends Node>(nodes: T[]): T[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const result: T[] = [];
  const visit = (n: T) => {
    if (visited.has(n.id)) return;
    if (n.parentId && byId.has(n.parentId)) visit(byId.get(n.parentId) as T);
    visited.add(n.id);
    result.push(n);
  };
  nodes.forEach(visit);
  return result;
}

function nodeSize(n: Node<DiagramNodeData>): { width: number; height: number } {
  const fallback = SHAPE_DEFAULT_SIZE[(n.type ?? 'defaultNode') as DiagramNodeType] ?? SHAPE_DEFAULT_SIZE.defaultNode;
  return {
    width: n.data?.width ?? fallback.width,
    height: n.data?.height ?? fallback.height,
  };
}

interface DiagramStore {
  // Current diagram
  currentDiagramId: string | null;
  diagramName: string;
  nodes: Node<DiagramNodeData>[];
  edges: Edge<DiagramEdgeData>[];
  viewport: Viewport;

  // Selection
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;

  // Clipboard
  clipboard: { nodes: Node<DiagramNodeData>[]; edges: Edge<DiagramEdgeData>[] } | null;

  // Saved diagrams
  savedDiagrams: SavedDiagram[];

  // Settings
  settings: EditorSettings;

  // UI state
  isPalettOpen: boolean;
  isSettingsPanelOpen: boolean;
  isSaving: boolean;
  /** Pointer behavior when dragging on empty canvas — see Toolbar's selection-tool toggle. */
  selectionTool: SelectionTool;
  /** partial = select anything the lasso touches; full = only fully-enclosed nodes. */
  lassoMode: LassoMode;
  /** View-only lock: while true, nodes can't be dragged/connected/selected —
   *  panning and zooming still work. Toggled from the Toolbar's lock button. */
  isCanvasLocked: boolean;
  /** Mirrors the browser's actual `document.fullscreenElement` state for the
   *  canvas wrapper, so the Toolbar's fullscreen button can show the right icon. */
  isCanvasFullscreen: boolean;
  /** The canvas itself owns the DOM ref needed to call requestFullscreen(), so
   *  it registers its own toggle function here on mount — the Toolbar (a
   *  sibling component, not a descendant) calls this instead of needing the ref. */
  canvasFullscreenToggle: (() => void) | null;

  // Actions
  setDiagramName: (name: string) => void;
  onNodesChange: (changes: NodeChange<Node<DiagramNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge<DiagramEdgeData>>[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node<DiagramNodeData>[]) => void;
  setEdges: (edges: Edge<DiagramEdgeData>[]) => void;
  setViewport: (viewport: Viewport) => void;

  addNode: (node: Node<DiagramNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<DiagramNodeData>) => void;
  /** Applies the same partial data to many nodes at once — used by the
   *  multi-select "group style editing" panel in SettingsPanel. */
  updateNodesData: (nodeIds: string[], data: Partial<DiagramNodeData>) => void;
  updateEdgeData: (edgeId: string, data: Partial<DiagramEdgeData>) => void;
  /** Applies the same partial data to many edges at once — used by the
   *  multi-select "group style editing" panel for edges in SettingsPanel. */
  updateEdgesData: (edgeIds: string[], data: Partial<DiagramEdgeData>) => void;
  /** Clears style-only fields (color, borders, font, size, rotation, ...) back
   *  to "unset" so each node falls back to its component's own built-in
   *  default — works the same whether nodeIds has one id (single) or many
   *  (group / multi-select). Label, position, connections and any
   *  computed/structural data (value, operation, shapeKind, url, ...) are
   *  left untouched. */
  resetNodesToDefault: (nodeIds: string[]) => void;
  /** Same idea for a single edge: style fields reset, edgeStyle falls back to
   *  the app-wide default edge type (Editor Settings), label/connections kept. */
  resetEdgeToDefault: (edgeId: string) => void;
  /** Same as resetEdgeToDefault, applied to many edges at once (group reset). */
  resetEdgesToDefault: (edgeIds: string[]) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  /** Removes every node AND edge — a blank diagram, same name/id kept. */
  clearCanvas: () => void;
  /** Removes every node (and, necessarily, every edge — they'd be dangling otherwise). */
  deleteAllNodes: () => void;
  /** Removes every edge, keeping all nodes in place. */
  deleteAllEdges: () => void;

  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;

  // Select-all (Toolbar) — each selects only its own kind and clears the rest,
  // so e.g. "select all edges" doesn't leave some stray node also selected.
  selectAllNodes: () => void;
  selectAllEdges: () => void;
  /** Selects every sub-flow (groupNode) container, not its children. */
  selectAllGroups: () => void;

  // Subflow / grouping
  reparentNode: (nodeId: string, parentId: string | null) => void;
  groupSelectedNodes: () => void;

  // Connection-handle visibility (Toolbar's "hide/show all handles" toggle) —
  // a single global flag, applied via a CSS class on the canvas wrapper
  // rather than touched per-node, so it's instant and never falls out of
  // sync with any individual node's own data.
  globalHideHandles: boolean;
  toggleGlobalHandles: () => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Clipboard
  copy: () => void;
  paste: () => void;

  // Diagram management
  newDiagram: () => void;
  saveDiagram: () => void;
  loadDiagram: (id: string) => void;
  deleteDiagram: (id: string) => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;

  // Settings
  updateSettings: (s: Partial<EditorSettings>) => void;

  // UI
  togglePalette: () => void;
  toggleSettingsPanel: () => void;
  setSelectionTool: (tool: SelectionTool) => void;
  setLassoMode: (mode: LassoMode) => void;
  toggleCanvasLock: () => void;
  setIsCanvasFullscreen: (v: boolean) => void;
  setCanvasFullscreenToggle: (fn: (() => void) | null) => void;

  // Computing flows (numberNode / operatorNode) — see
  // https://reactflow.dev/learn/advanced-use/computing-flows
  recomputeValues: () => void;
}

let historyTimeout: ReturnType<typeof setTimeout> | null = null;

export const useDiagramStore = create<DiagramStore>()(
  persist(
    (set, get) => ({
      currentDiagramId: null,
      diagramName: 'Untitled Diagram',
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeId: null,
      selectedEdgeId: null,
      history: [],
      historyIndex: -1,
      clipboard: null,
      savedDiagrams: [],
      settings: DEFAULT_SETTINGS,
      isPalettOpen: true,
      isSettingsPanelOpen: true,
      isSaving: false,
      selectionTool: 'pointer',
      lassoMode: 'partial',
      isCanvasLocked: false,
      isCanvasFullscreen: false,
      canvasFullscreenToggle: null,
      globalHideHandles: false,

      setDiagramName: (name) => set({ diagramName: name }),

      onNodesChange: (changes) => {
        const hasPositionChange = changes.some((c) => c.type === 'position' && c.dragging === false);
        const hasRemove = changes.some((c) => c.type === 'remove');
        const hasSelect = changes.some((c) => c.type === 'select');

        set((state) => {
          const selectChanges = changes.filter(
            (c): c is Extract<typeof c, { type: 'select' }> => c.type === 'select',
          );
          const selected = selectChanges.find((c) => c.selected);
          const deselected = selectChanges.find((c) => !c.selected && c.id === state.selectedNodeId);

          return {
            nodes: applyNodeChanges(changes, state.nodes) as Node<DiagramNodeData>[],
            selectedNodeId: selected ? selected.id : deselected ? null : state.selectedNodeId,
            selectedEdgeId: hasSelect ? null : state.selectedEdgeId,
          };
        });

        if (hasPositionChange || hasRemove) {
          if (historyTimeout) clearTimeout(historyTimeout);
          historyTimeout = setTimeout(() => get().pushHistory(), 300);
        }
      },

      onEdgesChange: (changes) => {
        const hasRemove = changes.some((c) => c.type === 'remove');
        const hasSelect = changes.some((c) => c.type === 'select');

        set((state) => {
          const selectChanges = changes.filter(
            (c): c is Extract<typeof c, { type: 'select' }> => c.type === 'select',
          );
          const selected = selectChanges.find((c) => c.selected);
          const deselected = selectChanges.find((c) => !c.selected && c.id === state.selectedEdgeId);

          return {
            edges: applyEdgeChanges(changes, state.edges) as Edge<DiagramEdgeData>[],
            selectedEdgeId: selected ? selected.id : deselected ? null : state.selectedEdgeId,
            selectedNodeId: hasSelect ? null : state.selectedNodeId,
          };
        });

        if (hasRemove) get().pushHistory();
      },

      onConnect: (connection) => {
        const { settings } = get();
        const strokeColor = resolveEdgeColor(undefined, settings.colorMode);
        set((state) => ({
          edges: addEdge(
            {
              ...connection,
              type: settings.defaultEdgeType,
              animated: false,
              markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor, width: 18, height: 18 },
              data: { edgeStyle: settings.defaultEdgeType, strokeWidth: 2, arrowEnd: true, arrowStart: false },
            },
            state.edges,
          ) as Edge<DiagramEdgeData>[],
        }));
        get().pushHistory();
      },

      setNodes: (nodes) => set({ nodes: sortNodesParentFirst(nodes) }),
      setEdges: (edges) => set({ edges }),
      setViewport: (viewport) => set({ viewport }),

      addNode: (node) => {
        set((state) => ({ nodes: [...state.nodes, node] }));
        get().pushHistory();
      },

      updateNodeData: (nodeId, data) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
          ),
        }));
        if (historyTimeout) clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => get().pushHistory(), 500);
      },

      updateNodesData: (nodeIds, data) => {
        const ids = new Set(nodeIds);
        set((state) => ({
          nodes: state.nodes.map((n) => (ids.has(n.id) ? { ...n, data: { ...n.data, ...data } } : n)),
        }));
        if (historyTimeout) clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => get().pushHistory(), 500);
      },

      updateEdgeData: (edgeId, data) => {
        const colorMode = get().settings.colorMode;
        set((state) => ({
          edges: state.edges.map((e) => {
            if (e.id !== edgeId) return e;
            const newData = { ...e.data, ...data } as DiagramEdgeData;
            const strokeColor = resolveEdgeColor(newData, colorMode);
            const arrowEnd = newData.arrowEnd ?? true;
            const arrowStart = newData.arrowStart ?? false;
            return {
              ...e,
              type: newData.edgeStyle ?? e.type,
              animated: newData.animated ?? e.animated,
              data: newData,
              markerEnd: arrowEnd
                ? { type: MarkerType.ArrowClosed, color: strokeColor, width: 18, height: 18 }
                : undefined,
              markerStart: arrowStart
                ? { type: MarkerType.ArrowClosed, color: strokeColor, width: 18, height: 18 }
                : undefined,
            };
          }),
        }));
        if (historyTimeout) clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => get().pushHistory(), 500);
      },

      updateEdgesData: (edgeIds, data) => {
        const ids = new Set(edgeIds);
        const colorMode = get().settings.colorMode;
        set((state) => ({
          edges: state.edges.map((e) => {
            if (!ids.has(e.id)) return e;
            const newData = { ...e.data, ...data } as DiagramEdgeData;
            const strokeColor = resolveEdgeColor(newData, colorMode);
            const arrowEnd = newData.arrowEnd ?? true;
            const arrowStart = newData.arrowStart ?? false;
            return {
              ...e,
              type: newData.edgeStyle ?? e.type,
              animated: newData.animated ?? e.animated,
              data: newData,
              markerEnd: arrowEnd
                ? { type: MarkerType.ArrowClosed, color: strokeColor, width: 18, height: 18 }
                : undefined,
              markerStart: arrowStart
                ? { type: MarkerType.ArrowClosed, color: strokeColor, width: 18, height: 18 }
                : undefined,
            };
          }),
        }));
        if (historyTimeout) clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => get().pushHistory(), 500);
      },

      // ── Reset to default ──────────────────────────────────────────────
      // "Default" = whatever each field's own fallback already is throughout
      // BaseNode/CustomEdge (e.g. `data.fontSize ?? 13`) — so resetting just
      // means clearing the override back to `undefined`. Only cosmetic
      // fields are touched; label text, position, links, connections and any
      // structural/computed data (value, operation, shapeKind, url, ...)
      // are left exactly as they were.
      resetNodesToDefault: (nodeIds) => {
        const ids = new Set(nodeIds);
        const STYLE_RESET = {
          colorToken: undefined,
          backgroundColor: undefined,
          borderColor: undefined,
          textColor: undefined,
          fontSize: undefined,
          fontWeight: undefined,
          borderWidth: undefined,
          borderStyle: undefined,
          borderRadius: undefined,
          rotation: undefined,
        } as const;
        set((state) => ({
          nodes: state.nodes.map((n) => (ids.has(n.id) ? { ...n, data: { ...n.data, ...STYLE_RESET } } : n)),
        }));
        get().pushHistory();
      },

      resetEdgeToDefault: (edgeId) => {
        const defaultEdgeType = get().settings.defaultEdgeType;
        const colorMode = get().settings.colorMode;
        set((state) => ({
          edges: state.edges.map((e) => {
            if (e.id !== edgeId) return e;
            const newData: DiagramEdgeData = {
              ...e.data,
              colorToken: undefined,
              strokeWidth: undefined,
              edgeStyle: defaultEdgeType,
              arrowStart: undefined,
              arrowEnd: undefined,
              animated: undefined,
            };
            const strokeColor = resolveEdgeColor(newData, colorMode);
            return {
              ...e,
              type: defaultEdgeType,
              animated: false,
              data: newData,
              markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor, width: 18, height: 18 },
              markerStart: undefined,
            };
          }),
        }));
        get().pushHistory();
      },

      resetEdgesToDefault: (edgeIds) => {
        const ids = new Set(edgeIds);
        const defaultEdgeType = get().settings.defaultEdgeType;
        const colorMode = get().settings.colorMode;
        set((state) => ({
          edges: state.edges.map((e) => {
            if (!ids.has(e.id)) return e;
            const newData: DiagramEdgeData = {
              ...e.data,
              colorToken: undefined,
              strokeWidth: undefined,
              edgeStyle: defaultEdgeType,
              arrowStart: undefined,
              arrowEnd: undefined,
              animated: undefined,
            };
            const strokeColor = resolveEdgeColor(newData, colorMode);
            return {
              ...e,
              type: defaultEdgeType,
              animated: false,
              data: newData,
              markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor, width: 18, height: 18 },
              markerStart: undefined,
            };
          }),
        }));
        get().pushHistory();
      },

      deleteSelected: () => {
        const { selectedNodeId, selectedEdgeId, nodes } = get();
        const multiSelected = nodes.filter((n) => n.selected);
        const deletingGroup = selectedNodeId
          ? nodes.find((n) => n.id === selectedNodeId && n.type === 'groupNode')
          : null;

        set((state) => {
          let nextNodes = state.nodes;
          let nextEdges = state.edges;

          if (multiSelected.length > 1) {
            // Multi-node delete (box/lasso select): ungroup any selected group
            // nodes (promote their children instead of destroying them, same
            // rule as the single-group case below) and remove every other
            // selected node, plus any edge touching a removed node.
            const idsToRemove = new Set(multiSelected.map((n) => n.id));
            const groupsBeingRemoved = new Map(multiSelected.filter((n) => n.type === 'groupNode').map((n) => [n.id, n]));

            nextNodes = state.nodes
              .filter((n) => !idsToRemove.has(n.id))
              .map((n) => {
                const parent = n.parentId ? groupsBeingRemoved.get(n.parentId) : undefined;
                if (!parent) return n;
                return {
                  ...n,
                  parentId: undefined,
                  extent: undefined,
                  position: { x: n.position.x + parent.position.x, y: n.position.y + parent.position.y },
                };
              });
            nextEdges = state.edges.filter((e) => !idsToRemove.has(e.source) && !idsToRemove.has(e.target));
          } else if (deletingGroup) {
            // Deleting a subflow ungroups its children (promotes them back to
            // absolute coordinates) instead of destroying them.
            nextNodes = state.nodes
              .filter((n) => n.id !== selectedNodeId)
              .map((n) =>
                n.parentId === selectedNodeId
                  ? {
                      ...n,
                      parentId: undefined,
                      extent: undefined,
                      position: {
                        x: n.position.x + deletingGroup.position.x,
                        y: n.position.y + deletingGroup.position.y,
                      },
                    }
                  : n,
              );
            nextEdges = state.edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
          } else if (selectedNodeId) {
            nextNodes = state.nodes.filter((n) => n.id !== selectedNodeId);
            nextEdges = state.edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
          }

          if (selectedEdgeId) {
            nextEdges = nextEdges.filter((e) => e.id !== selectedEdgeId);
          }

          return {
            nodes: sortNodesParentFirst(nextNodes),
            edges: nextEdges,
            selectedNodeId: null,
            selectedEdgeId: null,
          };
        });
        get().pushHistory();
      },

      duplicateSelected: () => {
        const { selectedNodeId, nodes } = get();
        if (!selectedNodeId) return;
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (!node) return;
        const newNode: Node<DiagramNodeData> = {
          ...node,
          id: `node-${Date.now()}`,
          position: { x: node.position.x + 30, y: node.position.y + 30 },
          selected: false,
        };
        // A duplicated group's children are NOT duplicated with it (v1) — only
        // the container. Keep ordering valid regardless.
        set((state) => ({ nodes: sortNodesParentFirst([...state.nodes, newNode]) }));
        get().pushHistory();
      },

      setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: id ? null : undefined }),
      setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: id ? null : undefined }),

      clearCanvas: () => {
        set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null });
        get().pushHistory();
      },

      deleteAllNodes: () => {
        // Edges can't dangle without their nodes, so this necessarily clears
        // edges too — kept as a separate action from clearCanvas mainly so
        // the Toolbar can offer it with its own distinct confirmation copy.
        set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null });
        get().pushHistory();
      },

      deleteAllEdges: () => {
        set({ edges: [], selectedEdgeId: null });
        get().pushHistory();
      },

      // ── Subflow / grouping ────────────────────────────────────────────

      reparentNode: (nodeId, parentId) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          // v1 keeps subflows a single level deep: group nodes can't be nested.
          if (!node || node.type === 'groupNode') return state;
          if (parentId === (node.parentId ?? null)) return state;

          let nodes = state.nodes;

          if (parentId) {
            const parent = state.nodes.find((n) => n.id === parentId);
            if (!parent || parent.id === nodeId) return state;
            const prevParent = node.parentId ? state.nodes.find((n) => n.id === node.parentId) : null;
            const absX = prevParent ? node.position.x + prevParent.position.x : node.position.x;
            const absY = prevParent ? node.position.y + prevParent.position.y : node.position.y;
            const relPos = { x: absX - parent.position.x, y: absY - parent.position.y };
            nodes = state.nodes.map((n) =>
              n.id === nodeId ? { ...n, parentId, extent: 'parent' as const, position: relPos } : n,
            );
          } else {
            const prevParent = node.parentId ? state.nodes.find((n) => n.id === node.parentId) : null;
            const absPos = prevParent
              ? { x: node.position.x + prevParent.position.x, y: node.position.y + prevParent.position.y }
              : node.position;
            nodes = state.nodes.map((n) =>
              n.id === nodeId ? { ...n, parentId: undefined, extent: undefined, position: absPos } : n,
            );
          }

          return { nodes: sortNodesParentFirst(nodes) };
        });
        get().pushHistory();
      },

      groupSelectedNodes: () => {
        const { nodes } = get();
        const selected = nodes.filter((n) => n.selected && n.type !== 'groupNode' && !n.parentId);
        if (selected.length === 0) return;

        const PAD = 36;
        const HEADER = 28;
        const minX = Math.min(...selected.map((n) => n.position.x)) - PAD;
        const minY = Math.min(...selected.map((n) => n.position.y)) - PAD - HEADER;
        const maxX = Math.max(...selected.map((n) => n.position.x + nodeSize(n).width)) + PAD;
        const maxY = Math.max(...selected.map((n) => n.position.y + nodeSize(n).height)) + PAD;

        const groupId = `node-${Date.now()}-group`;
        const groupNode: Node<DiagramNodeData> = {
          id: groupId,
          type: 'groupNode',
          position: { x: minX, y: minY },
          dragHandle: '.subflow-drag-handle',
          data: { label: 'Sub-flow', colorToken: 'neutral', width: maxX - minX, height: maxY - minY },
          selected: false,
        };

        const selectedIds = new Set(selected.map((n) => n.id));
        const updatedNodes = nodes.map((n) => {
          if (!selectedIds.has(n.id)) return n;
          return {
            ...n,
            parentId: groupId,
            extent: 'parent' as const,
            position: { x: n.position.x - minX, y: n.position.y - minY },
            selected: false,
          };
        });

        set({ nodes: sortNodesParentFirst([groupNode, ...updatedNodes]) });
        get().pushHistory();
      },

      // ── Select-all (Toolbar) ────────────────────────────────────────────
      // Each of these selects only its own kind and explicitly clears
      // everything else, so "select all edges" can't leave some previously
      // selected node still marked selected too.
      selectAllNodes: () => {
        set((state) => ({
          nodes: state.nodes.map((n) => ({ ...n, selected: true })),
          edges: state.edges.map((e) => ({ ...e, selected: false })),
          selectedNodeId: null,
          selectedEdgeId: null,
        }));
      },

      selectAllEdges: () => {
        set((state) => ({
          edges: state.edges.map((e) => ({ ...e, selected: true })),
          nodes: state.nodes.map((n) => ({ ...n, selected: false })),
          selectedNodeId: null,
          selectedEdgeId: null,
        }));
      },

      selectAllGroups: () => {
        set((state) => ({
          nodes: state.nodes.map((n) => ({ ...n, selected: n.type === 'groupNode' })),
          edges: state.edges.map((e) => ({ ...e, selected: false })),
          selectedNodeId: null,
          selectedEdgeId: null,
        }));
      },

      pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        const entry: HistoryEntry = {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(entry);
        if (newHistory.length > MAX_HISTORY) newHistory.shift();
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;
        const prev = history[historyIndex - 1];
        set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        const next = history[historyIndex + 1];
        set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 });
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      copy: () => {
        const { selectedNodeId, nodes, edges } = get();
        if (!selectedNodeId) return;
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (!node) return;
        const relatedEdges = edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId);
        set({ clipboard: { nodes: [node], edges: relatedEdges } });
      },

      paste: () => {
        const { clipboard } = get();
        if (!clipboard || clipboard.nodes.length === 0) return;
        const idMap: Record<string, string> = {};
        const newNodes = clipboard.nodes.map((n) => {
          const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          idMap[n.id] = newId;
          // Pasted nodes are always dropped at top level, regardless of the
          // original's parentId, to avoid pasting into a group that may no
          // longer exist (or exist at all) in this diagram.
          return { ...n, id: newId, parentId: undefined, extent: undefined, position: { x: n.position.x + 40, y: n.position.y + 40 }, selected: false };
        });
        set((state) => ({ nodes: sortNodesParentFirst([...state.nodes, ...newNodes]) }));
        get().pushHistory();
      },

      newDiagram: () => {
        set({
          currentDiagramId: null,
          diagramName: 'Untitled Diagram',
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedNodeId: null,
          selectedEdgeId: null,
          history: [],
          historyIndex: -1,
        });
      },

      saveDiagram: () => {
        const { currentDiagramId, diagramName, nodes, edges, viewport, savedDiagrams } = get();
        set({ isSaving: true });
        const id = currentDiagramId ?? `diagram-${Date.now()}`;
        const now = new Date().toISOString();
        const existing = savedDiagrams.find((d) => d.id === id);
        const diagram: SavedDiagram = {
          id,
          name: diagramName,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          viewport,
        };
        const others = savedDiagrams.filter((d) => d.id !== id);
        set({ savedDiagrams: [diagram, ...others], currentDiagramId: id, isSaving: false });
      },

      loadDiagram: (id) => {
        const { savedDiagrams } = get();
        const diagram = savedDiagrams.find((d) => d.id === id);
        if (!diagram) return;
        set({
          currentDiagramId: diagram.id,
          diagramName: diagram.name,
          nodes: sortNodesParentFirst(diagram.nodes),
          edges: diagram.edges,
          viewport: diagram.viewport,
          selectedNodeId: null,
          selectedEdgeId: null,
          history: [],
          historyIndex: -1,
        });
      },

      deleteDiagram: (id) => {
        set((state) => ({
          savedDiagrams: state.savedDiagrams.filter((d) => d.id !== id),
          currentDiagramId: state.currentDiagramId === id ? null : state.currentDiagramId,
        }));
      },

      exportJSON: () => {
        const { diagramName, nodes, edges, viewport } = get();
        return JSON.stringify({ name: diagramName, nodes, edges, viewport }, null, 2);
      },

      importJSON: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            diagramName: data.name ?? 'Imported Diagram',
            nodes: sortNodesParentFirst(data.nodes ?? []),
            edges: data.edges ?? [],
            viewport: data.viewport ?? { x: 0, y: 0, zoom: 1 },
            currentDiagramId: null,
            history: [],
            historyIndex: -1,
          });
          get().pushHistory();
        } catch {
          throw new Error('Invalid JSON');
        }
      },

      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      togglePalette: () => set((state) => ({ isPalettOpen: !state.isPalettOpen })),
      toggleGlobalHandles: () => set((state) => ({ globalHideHandles: !state.globalHideHandles })),
      toggleSettingsPanel: () => set((state) => ({ isSettingsPanelOpen: !state.isSettingsPanelOpen })),
      setSelectionTool: (tool) => set({ selectionTool: tool }),
      setLassoMode: (mode) => set({ lassoMode: mode }),
      toggleCanvasLock: () => set((state) => ({ isCanvasLocked: !state.isCanvasLocked })),
      setIsCanvasFullscreen: (v) => set({ isCanvasFullscreen: v }),
      setCanvasFullscreenToggle: (fn) => set({ canvasFullscreenToggle: fn }),

      // ── Computing flows ────────────────────────────────────────────────
      // Walks the graph from each numberNode's literal value through any
      // chain of operatorNodes, memoizing as it goes (with a cycle guard so a
      // loop just resolves to `undefined`/no-op instead of hanging), and
      // writes the result onto each operatorNode's data.result. Only actually
      // touches state if a result truly changed, so this is safe to call
      // liberally (e.g. from an effect on every nodes/edges change) without
      // causing a render loop.
      recomputeValues: () => {
        const { nodes, edges } = get();
        const byId = new Map(nodes.map((n) => [n.id, n]));
        // Tracks WHICH handle each incoming edge targets — required now that
        // operatorNode's handles carry meaning (a vs b vs x vs unlimited),
        // not just "some value arrived".
        const incomingByHandle = new Map<string, { source: string; targetHandle: string | null }[]>();
        edges.forEach((e) => {
          const arr = incomingByHandle.get(e.target) ?? [];
          arr.push({ source: e.source, targetHandle: e.targetHandle ?? null });
          incomingByHandle.set(e.target, arr);
        });
        // First-source-only view, for nodes with a single unnamed input handle
        // (geometryCalcNode/beamCalcNode's "shape-in").
        const firstIncomingSource = (nodeId: string) => incomingByHandle.get(nodeId)?.[0]?.source;

        const memo = new Map<string, number | undefined>();
        const visiting = new Set<string>();

        const valueOf = (nodeId: string): number | undefined => {
          if (memo.has(nodeId)) return memo.get(nodeId);
          const node = byId.get(nodeId);
          if (!node) return undefined;

          if (node.type === 'numberNode') {
            const v = (node.data as DiagramNodeData).value;
            memo.set(nodeId, v);
            return v;
          }

          if (node.type === 'constantNode') {
            const key = (node.data as DiagramNodeData).constantKey ?? 'pi';
            const v = MATH_CONSTANT_BY_KEY[key]?.value ?? MATH_CONSTANTS[0].value;
            memo.set(nodeId, v);
            return v;
          }

          if (node.type === 'operatorNode') {
            if (visiting.has(nodeId)) {
              memo.set(nodeId, undefined);
              return undefined;
            }
            visiting.add(nodeId);

            const op = (node.data as DiagramNodeData).operation ?? 'add';
            const arity = OPERATOR_ARITY[op];
            const conns = incomingByHandle.get(nodeId) ?? [];

            let values: number[];
            if (arity === 'unary') {
              const c = conns.find((c) => c.targetHandle === 'x');
              const v = c ? valueOf(c.source) : undefined;
              values = typeof v === 'number' ? [v] : [];
            } else if (arity === 'binary') {
              const a = conns.find((c) => c.targetHandle === 'a');
              const b = conns.find((c) => c.targetHandle === 'b');
              const av = a ? valueOf(a.source) : undefined;
              const bv = b ? valueOf(b.source) : undefined;
              values = typeof av === 'number' && typeof bv === 'number' ? [av, bv] : [];
            } else {
              values = conns.map((c) => valueOf(c.source)).filter((v): v is number => typeof v === 'number');
            }

            visiting.delete(nodeId);
            const result = evaluateOperator(op, values);
            memo.set(nodeId, result);
            return result;
          }

          // Calculator nodes (perimeter/area/volume, or beam Ix) act as value
          // producers too, so their output can feed straight into an
          // operatorNode: shapeNode → geometryCalcNode/beamCalcNode → operatorNode.
          // Mirrors the "connected to a shapeNode" logic in BaseNode.tsx's
          // GeometryCalcNode/BeamCalcNode — falls back to the node's own
          // standalone calcShape/beamShape fields when nothing is connected.
          if (node.type === 'geometryCalcNode') {
            const data = node.data as DiagramNodeData;
            const sourceId = firstIncomingSource(nodeId);
            const sourceNode = sourceId ? byId.get(sourceId) : undefined;
            const upstream = sourceNode?.type === 'shapeNode' ? (sourceNode.data as DiagramNodeData) : undefined;
            const shape = (upstream ? upstream.shapeKind : data.calcShape) ?? 'rectangle';
            const inputs = (upstream ? upstream.shapeInputs : data.calcInputs) ?? {};
            const availableModes = GEOMETRY_SHAPE_MODES[shape];
            const mode = availableModes.includes(data.calcMode ?? 'area') ? (data.calcMode ?? 'area') : availableModes[0];
            const result = computeGeometry(shape, mode, inputs);
            const value = result ?? undefined;
            memo.set(nodeId, value);
            return value;
          }

          if (node.type === 'beamCalcNode') {
            const data = node.data as DiagramNodeData;
            const sourceId = firstIncomingSource(nodeId);
            const sourceNode = sourceId ? byId.get(sourceId) : undefined;
            const upstream = sourceNode?.type === 'shapeNode' ? (sourceNode.data as DiagramNodeData) : undefined;
            let value: number | undefined;
            if (upstream) {
              const upstreamShape = upstream.shapeKind;
              if (upstreamShape && isBeamCompatible(upstreamShape)) {
                const beamInputs = toBeamInputs(upstreamShape, upstream.shapeInputs ?? {});
                if (!validateBeamInputs(upstreamShape, beamInputs)) {
                  const result = computeSecondMomentOfArea(upstreamShape, beamInputs);
                  value = result ?? undefined;
                }
              }
            } else {
              const shape = data.beamShape ?? 'rectangle';
              const beamInputs = data.beamInputs ?? {};
              if (!validateBeamInputs(shape, beamInputs)) {
                const result = computeSecondMomentOfArea(shape, beamInputs);
                value = result ?? undefined;
              }
            }
            memo.set(nodeId, value);
            return value;
          }

          return undefined;
        };

        let changed = false;
        const nextNodes = nodes.map((n) => {
          if (n.type !== 'operatorNode') return n;
          const result = valueOf(n.id);
          if ((n.data as DiagramNodeData).result === result) return n;
          changed = true;
          return { ...n, data: { ...n.data, result } };
        });

        if (changed) set({ nodes: nextNodes });
      },
    }),
    {
      name: 'diagram-editor-store',
      // Persist the saved-diagram library AND the current working draft, so a
      // page refresh keeps whatever the user was editing (not just named
      // saves). currentDiagramId is included so a post-refresh Ctrl+S / Save
      // updates the same library entry instead of creating a duplicate.
      partialize: (state) => ({
        savedDiagrams: state.savedDiagrams,
        settings: state.settings,
        diagramName: state.diagramName,
        currentDiagramId: state.currentDiagramId,
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
      }),
    },
  ),
);
