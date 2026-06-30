import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import { nanoid } from "nanoid";
import type {
  DiagramStore,
  DiagramNode,
  DiagramEdge,
  DiagramNodeData,
  DiagramEdgeData,
  NodeShape,
  SelectionState,
  ActivePanel,
  EditorMode,
  HistorySnapshot,
  DiagramDocument,
} from "../types/diagram.types";
import {
  DEFAULT_NODE_STYLE,
  DEFAULT_EDGE_STYLE,
  DEFAULT_NODE_SIZE,
} from "../constants/defaults";
// Maximum number of undo steps to retain
const MAX_HISTORY = 50;
// Document schema version for compatibility checks
const SCHEMA_VERSION = "1.0.0";
// Initial empty state for the diagram editor
const initialState = {
  nodes: [] as DiagramNode[],
  edges: [] as DiagramEdge[],
  viewport: { x: 0, y: 0, zoom: 1 },
  selection: { nodeIds: [], edgeIds: [] } as SelectionState,
  activePanel: null as ActivePanel,
  editorMode: "select" as EditorMode,
  isDirty: false,
  past: [] as HistorySnapshot[],
  future: [] as HistorySnapshot[],
  diagramName: "Untitled Diagram",
  diagramId: nanoid(),
};
// Push current nodes/edges onto the undo stack, capped at MAX_HISTORY
function pushSnapshot(
  past: HistorySnapshot[],
  nodes: DiagramNode[],
  edges: DiagramEdge[],
): HistorySnapshot[] {
  const next = [...past, { nodes: [...nodes], edges: [...edges] }];
  return next.length > MAX_HISTORY
    ? next.slice(next.length - MAX_HISTORY)
    : next;
}
export const useDiagramStore = create<DiagramStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    // Handle node changes from React Flow (move, resize, remove, select)
    onNodesChange: (changes) => {
      set((state) => ({
        nodes: applyNodeChanges(changes, state.nodes) as DiagramNode[],
        isDirty: true,
      }));
    },
    // Handle edge changes from React Flow (remove, select)
    onEdgesChange: (changes) => {
      set((state) => ({
        edges: applyEdgeChanges(changes, state.edges) as DiagramEdge[],
        isDirty: true,
      }));
    },
    // Handle new connection between two nodes
    onConnect: (connection) => {
      const { nodes, edges, past } = get();
      const newEdge: DiagramEdge = {
        ...connection,
        id: nanoid(),
        type: "custom",
        data: { ...DEFAULT_EDGE_STYLE },
      } as DiagramEdge;
      set({
        edges: addEdge(newEdge, edges) as DiagramEdge[],
        past: pushSnapshot(past, nodes, edges),
        future: [],
        isDirty: true,
      });
    },
    // Add a new node of a given shape at the specified canvas position

    addNode: (shape: NodeShape, position: { x: number; y: number }) => {
      const { nodes, edges, past } = get();
      const newNode: DiagramNode = {
        id: nanoid(),
        type: shape,
        position,
        width: DEFAULT_NODE_SIZE.width,
        height: DEFAULT_NODE_SIZE.height,
        data: {
          label: "New Node",
          shape,
          style: { ...DEFAULT_NODE_STYLE },
        } as DiagramNodeData,
      };
      set({
        nodes: [...nodes, newNode],
        past: pushSnapshot(past, nodes, edges),
        future: [],
        isDirty: true,
      });
    },
    // Update data fields on a specific node by id
    updateNodeData: (nodeId: string, data: Partial<DiagramNodeData>) => {
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
        ),
        isDirty: true,
      }));
    },
    // Delete all currently selected nodes (and their connected edges)
    deleteSelectedNodes: () => {
      const { nodes, edges, selection, past } = get();
      if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0)
        return;
      const nodeIdSet = new Set(selection.nodeIds);
      const edgeIdSet = new Set(selection.edgeIds);
      const nextNodes = nodes.filter((n) => !nodeIdSet.has(n.id));
      // Remove edges connected to deleted nodes or directly selected
      const nextEdges = edges.filter(
        (e) =>
          !edgeIdSet.has(e.id) &&
          !nodeIdSet.has(e.source) &&
          !nodeIdSet.has(e.target),
      );
      set({
        nodes: nextNodes,
        edges: nextEdges,
        selection: { nodeIds: [], edgeIds: [] },
        past: pushSnapshot(past, nodes, edges),
        future: [],
        isDirty: true,
      });
    },
    // Update data fields on a specific edge by id
    updateEdgeData: (edgeId: string, data: Partial<DiagramEdgeData>) => {
      set((state) => ({
        edges: state.edges.map((e) =>
          e.id === edgeId
            ? { ...e, data: { ...e.data, ...data } as DiagramEdgeData }
            : e,
        ),
        isDirty: true,
      }));
    },
    setNodes: (nodes: DiagramNode[]) => {
      set({ nodes, isDirty: true });
    },

    setEdges: (edges: DiagramEdge[]) => {
      set({ edges, isDirty: true });
    },
    selection: { nodeIds: [], edgeIds: [] },

    setSelection: (nodeIds, edgeIds) =>
      set({ selection: { nodeIds, edgeIds } }),

    setSelectedNode: (id) =>
      set((state) => ({
        selection: { nodeIds: id ? [id] : [], edgeIds: [] },
      })),

    setSelectedEdge: (id) =>
      set((state) => ({
        selection: { nodeIds: [], edgeIds: id ? [id] : [] },
      })),
    // Clear all selections
    clearSelection: () => set({ selection: { nodeIds: [], edgeIds: [] } }),
    // Open or close a side panel
    setActivePanel: (panel: ActivePanel) => set({ activePanel: panel }),
    // Switch the editor interaction mode
    setEditorMode: (mode: EditorMode) => set({ editorMode: mode }),
    // Update the viewport (pan/zoom)
    setViewport: (viewport) => set({ viewport }),
    // Rename the diagram
    setDiagramName: (name: string) => set({ diagramName: name, isDirty: true }),
    // Undo: restore previous snapshot
    undo: () => {
      const { past, nodes, edges, future } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      set({
        nodes: previous.nodes,
        edges: previous.edges,
        past: past.slice(0, past.length - 1),
        future: [{ nodes: [...nodes], edges: [...edges] }, ...future],
        isDirty: true,
      });
    },
    // Redo: re-apply a previously undone snapshot
    redo: () => {
      const { past, nodes, edges, future } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        nodes: next.nodes,
        edges: next.edges,
        past: pushSnapshot(past, nodes, edges),
        future: future.slice(1),
        isDirty: true,
      });
    },
    // To be added to diagramStore.ts if needed

    // Load a full DiagramDocument into the editor
    loadDocument: (doc: DiagramDocument) => {
      set({
        nodes: doc.nodes,
        edges: doc.edges,
        viewport: doc.viewport,
        diagramName: doc.name,
        diagramId: doc.id,
        selection: { nodeIds: [], edgeIds: [] },
        past: [],
        future: [],
        isDirty: false,
      });
    },
    // Reset the canvas to an empty state with a new id
    resetDiagram: () => {
      set({
        ...initialState,
        diagramId: nanoid(),
        isDirty: false,
      });
    },
    // Serialize current state into a DiagramDocument
    buildDocument: (): DiagramDocument => {
      const { nodes, edges, viewport, diagramName, diagramId } = get();
      return {
        id: diagramId,
        name: diagramName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: SCHEMA_VERSION,
        nodes,
        edges,
        viewport,
      };
    },
  })),
);
// Convenience selectors for use in components
export const selectNodes = (s: DiagramStore) => s.nodes;
export const selectEdges = (s: DiagramStore) => s.edges;
export const selectCanUndo = (s: DiagramStore) => s.past.length > 0;
export const selectCanRedo = (s: DiagramStore) => s.future.length > 0;
export const selectSelection = (s: DiagramStore) => s.selection;
export const selectIsDirty = (s: DiagramStore) => s.isDirty;
