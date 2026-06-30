'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Viewport,
} from '@xyflow/react';
import type { DiagramNodeData, DiagramEdgeData, SavedDiagram, EditorSettings, HistoryEntry } from '../types';

const DEFAULT_SETTINGS: EditorSettings = {
  snapToGrid: false,
  snapGrid: [15, 15],
  showMiniMap: true,
  showControls: true,
  backgroundVariant: 'dots',
  colorMode: 'light',
  defaultEdgeType: 'smoothstep',
  autoSave: true,
};

const MAX_HISTORY = 50;

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
  updateEdgeData: (edgeId: string, data: Partial<DiagramEdgeData>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;

  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;

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
        set((state) => ({
          edges: addEdge(
            {
              ...connection,
              type: settings.defaultEdgeType,
              animated: false,
              data: { edgeStyle: settings.defaultEdgeType, strokeWidth: 2, color: '#94a3b8' },
            },
            state.edges,
          ) as Edge<DiagramEdgeData>[],
        }));
        get().pushHistory();
      },

      setNodes: (nodes) => set({ nodes }),
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

      updateEdgeData: (edgeId, data) => {
        set((state) => ({
          edges: state.edges.map((e) => {
            if (e.id !== edgeId) return e;
            const newData = { ...e.data, ...data } as DiagramEdgeData;
            return {
              ...e,
              type: newData.edgeStyle ?? e.type,
              animated: newData.animated ?? e.animated,
              data: newData,
            };
          }),
        }));
        if (historyTimeout) clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => get().pushHistory(), 500);
      },

      deleteSelected: () => {
        const { selectedNodeId, selectedEdgeId } = get();
        set((state) => ({
          nodes: selectedNodeId ? state.nodes.filter((n) => n.id !== selectedNodeId) : state.nodes,
          edges: selectedEdgeId
            ? state.edges.filter((e) => e.id !== selectedEdgeId)
            : selectedNodeId
            ? state.edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
            : state.edges,
          selectedNodeId: null,
          selectedEdgeId: null,
        }));
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
        set((state) => ({ nodes: [...state.nodes, newNode] }));
        get().pushHistory();
      },

      setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: id ? null : undefined }),
      setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: id ? null : undefined }),

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
          return { ...n, id: newId, position: { x: n.position.x + 40, y: n.position.y + 40 }, selected: false };
        });
        set((state) => ({ nodes: [...state.nodes, ...newNodes] }));
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
          nodes: diagram.nodes,
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
            nodes: data.nodes ?? [],
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
      toggleSettingsPanel: () => set((state) => ({ isSettingsPanelOpen: !state.isSettingsPanelOpen })),
    }),
    {
      name: 'diagram-editor-store',
      partialize: (state) => ({ savedDiagrams: state.savedDiagrams, settings: state.settings, diagramName: state.diagramName }),
    },
  ),
);
