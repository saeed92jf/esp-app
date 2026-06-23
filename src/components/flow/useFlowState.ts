// useFlowState.ts - Custom hook for flow state management with undo/redo
import { useState, useCallback, useEffect, useRef } from "react";
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import { saveFlowState, loadFlowState, setupAutoSave } from "@/lib/flowStorage";

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

export function useFlowState(initialNodes: Node[], initialEdges: Edge[]) {
  // Try to load saved state, fallback to initial data
  const savedState = loadFlowState();

  const [nodes, setNodes] = useState<Node[]>(savedState?.nodes || initialNodes);
  const [edges, setEdges] = useState<Edge[]>(savedState?.edges || initialEdges);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ nodes, edges }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isApplyingHistory = useRef(false);

  // Add to history when nodes or edges change
  useEffect(() => {
    if (isApplyingHistory.current) return;

    const newState = { nodes, edges };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-MAX_HISTORY);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [nodes, edges, historyIndex]);

  // Undo/Redo handlers
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isApplyingHistory.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isApplyingHistory.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Auto-save setup
  useEffect(() => {
    const cleanup = setupAutoSave(() => ({ nodes, edges }));
    return cleanup;
  }, [nodes, edges]);

  // Standard ReactFlow handlers
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, type: "buttonedge" }, eds)),
    [],
  );

  // Manual save
  const saveState = useCallback(() => {
    saveFlowState(nodes, edges);
  }, [nodes, edges]);

  // Reset to initial data
  const resetState = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHistory([{ nodes: initialNodes, edges: initialEdges }]);
    setHistoryIndex(0);
  }, [initialNodes, initialEdges]);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) =>
      eds.filter((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        return (
          sourceNode &&
          !sourceNode.selected &&
          targetNode &&
          !targetNode.selected
        );
      }),
    );
  }, [nodes]);

  // Add new node
  const addNode = useCallback((node: Node) => {
    setNodes((nds) => [...nds, node]);
  }, []);

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<Node["data"]>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node,
        ),
      );
    },
    [],
  );

  return {
    nodes,
    edges,
    selectedEdgeId,
    setSelectedEdgeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    saveState,
    resetState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    deleteSelectedNodes,
    addNode,
    updateNodeData,
    setNodes,
    setEdges,
  };
}
