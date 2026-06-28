// src/components/flow-general/hooks/useFlowEditor.ts
"use client";

import { useCallback, useState } from "react";
import {
  type Node,
  type Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import type { DynamicNodeData, DynamicEdgeData, FlowState } from "../types";

// History stack entry type
interface HistoryEntry {
  nodes: Node<DynamicNodeData>[];
  edges: Edge<DynamicEdgeData>[];
}

/**
 * Options for configuring the flow editor hook.
 */
export interface UseFlowEditorOptions {
  initialNodes?: Node<DynamicNodeData>[];
  initialEdges?: Edge<DynamicEdgeData>[];
  onSave?: (state: FlowState) => void;
  onLoad?: () => FlowState | null | Promise<FlowState | null>;
  autoSave?: boolean;
  autoSaveInterval?: number;
  storageKey?: string;
}

/**
 * Custom hook for managing React Flow editor state with undo/redo functionality.
 */
export function useFlowEditor(options: UseFlowEditorOptions = {}) {
  const { initialNodes = [], initialEdges = [] } = options;

  // Current flow state
  const [nodes, setNodes] = useState<Node<DynamicNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge<DynamicEdgeData>[]>(initialEdges);

  // History management for undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  /**
   * Save current state to history stack.
   */
  const saveToHistory = useCallback(
    (newNodes: Node<DynamicNodeData>[], newEdges: Edge<DynamicEdgeData>[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex],
  );

  /**
   * Handle node changes from React Flow.
   * applyNodeChanges returns NodeBase[] — cast back to Node<DynamicNodeData>[].
   */
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(
          changes,
          nds,
        ) as Node<DynamicNodeData>[];
        saveToHistory(updatedNodes, edges);
        return updatedNodes;
      });
    },
    [edges, saveToHistory],
  );

  /**
   * Handle edge changes from React Flow.
   * applyEdgeChanges returns EdgeBase[] — cast back to Edge<DynamicEdgeData>[].
   */
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updatedEdges = applyEdgeChanges(
          changes,
          eds,
        ) as Edge<DynamicEdgeData>[];
        saveToHistory(nodes, updatedEdges);
        return updatedEdges;
      });
    },
    [nodes, saveToHistory],
  );

  /**
   * Handle new connections between nodes.
   */
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const updatedEdges = addEdge(
          connection,
          eds,
        ) as Edge<DynamicEdgeData>[];
        saveToHistory(nodes, updatedEdges);
        return updatedEdges;
      });
    },
    [nodes, saveToHistory],
  );

  /**
   * Add a new node to the flow.
   */
  const addNode = useCallback(
    (node: Node<DynamicNodeData>) => {
      const newNodes = [...nodes, node];
      setNodes(newNodes);
      saveToHistory(newNodes, edges);
    },
    [nodes, edges, saveToHistory],
  );

  /**
   * Update an existing node.
   */
  const updateNode = useCallback(
    (nodeId: string, updates: Partial<Node<DynamicNodeData>>) => {
      const newNodes = nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node,
      );
      setNodes(newNodes);
      saveToHistory(newNodes, edges);
    },
    [nodes, edges, saveToHistory],
  );

  /**
   * Delete a node by ID.
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      const newNodes = nodes.filter((node) => node.id !== nodeId);
      const newEdges = edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      );
      setNodes(newNodes);
      setEdges(newEdges);
      saveToHistory(newNodes, newEdges);
    },
    [nodes, edges, saveToHistory],
  );

  /**
   * Add a new edge to the flow.
   */
  const addEdgeManual = useCallback(
    (edge: Edge<DynamicEdgeData>) => {
      const newEdges = [...edges, edge];
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);
    },
    [nodes, edges, saveToHistory],
  );

  /**
   * Update an existing edge.
   */
  const updateEdge = useCallback(
    (edgeId: string, updates: Partial<Edge<DynamicEdgeData>>) => {
      const newEdges = edges.map((edge) =>
        edge.id === edgeId ? { ...edge, ...updates } : edge,
      );
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);
    },
    [nodes, edges, saveToHistory],
  );

  /**
   * Delete an edge by ID.
   */
  const deleteEdge = useCallback(
    (edgeId: string) => {
      const newEdges = edges.filter((edge) => edge.id !== edgeId);
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);
    },
    [nodes, edges, saveToHistory],
  );

  /**
   * Undo last change.
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  /**
   * Redo previously undone change.
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  /**
   * Reset flow to initial empty state.
   */
  const reset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setHistory([{ nodes: [], edges: [] }]);
    setHistoryIndex(0);
  }, []);

  /**
   * Export current flow state.
   */
  const exportState = useCallback((): FlowState => {
    return { nodes, edges };
  }, [nodes, edges]);

  /**
   * Import flow state — supports both sync and async onLoad callbacks.
   */
  const importState = useCallback((state: FlowState) => {
    setNodes(state.nodes);
    setEdges(state.edges);
    setHistory([{ nodes: state.nodes, edges: state.edges }]);
    setHistoryIndex(0);
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addEdgeManual,
    updateEdge,
    deleteEdge,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    exportState,
    importState,
  };
}
