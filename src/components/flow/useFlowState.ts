// src/components/flow/useFlowState.ts
// Custom hook for flow state management with undo/redo.
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

// ─── Lazy initialiser – safe on the server (localStorage guarded inside) ──────
function loadOrFallback<T>(fallback: T[], storageKey: "nodes" | "edges"): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = loadFlowState();
    if (saved && Array.isArray(saved[storageKey])) {
      return saved[storageKey] as T[];
    }
  } catch {
    // ignore
  }
  return fallback;
}

export function useFlowState(initialNodes: Node[], initialEdges: Edge[]) {
  // ── State – lazy initialisers avoid SSR / localStorage access at module level
  const [nodes, setNodes] = useState<Node[]>(() =>
    loadOrFallback<Node>(initialNodes, "nodes"),
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    loadOrFallback<Edge>(initialEdges, "edges"),
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // ── History ─────────────────────────────────────────────────────────────────
  // Stored in refs to avoid dependency-array issues; derived UI state (canUndo /
  // canRedo) is exposed as separate booleans that re-render only on change.
  const historyRef = useRef<HistoryState[]>([{ nodes, edges }]);
  const indexRef = useRef(0);
  const skipRef = useRef(false); // true while applying undo/redo

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateCaps = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  // Push a snapshot whenever nodes or edges change (but not during undo/redo).
  useEffect(() => {
    if (skipRef.current) return;
    const snap: HistoryState = { nodes, edges };
    // Truncate future states then append
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      indexRef.current += 1;
    }
    updateCaps();
    // We intentionally exclude updateCaps from deps to avoid infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    skipRef.current = true;
    indexRef.current -= 1;
    const { nodes: n, edges: e } = historyRef.current[indexRef.current];
    setNodes(n);
    setEdges(e);
    updateCaps();
    // Allow next change to be tracked after React flushes
    setTimeout(() => {
      skipRef.current = false;
    }, 0);
  }, [updateCaps]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    skipRef.current = true;
    indexRef.current += 1;
    const { nodes: n, edges: e } = historyRef.current[indexRef.current];
    setNodes(n);
    setEdges(e);
    updateCaps();
    setTimeout(() => {
      skipRef.current = false;
    }, 0);
  }, [updateCaps]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // ── Auto-save ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return setupAutoSave(() => ({ nodes, edges }));
  }, [nodes, edges]);

  // ── React Flow handlers ──────────────────────────────────────────────────────
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

  // ── Manual save ──────────────────────────────────────────────────────────────
  const saveState = useCallback(() => {
    saveFlowState(nodes, edges);
  }, [nodes, edges]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    skipRef.current = true;
    setNodes(initialNodes);
    setEdges(initialEdges);
    historyRef.current = [{ nodes: initialNodes, edges: initialEdges }];
    indexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setTimeout(() => {
      skipRef.current = false;
    }, 0);
  }, [initialNodes, initialEdges]);

  // ── Delete selected ──────────────────────────────────────────────────────────
  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => {
      const selectedIds = new Set(
        nds.filter((n) => n.selected).map((n) => n.id),
      );
      setEdges((eds) =>
        eds.filter(
          (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target),
        ),
      );
      return nds.filter((n) => !n.selected);
    });
  }, []);

  // ── Add / update ─────────────────────────────────────────────────────────────
  const addNode = useCallback((node: Node) => {
    setNodes((nds) => [...nds, node]);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<Node["data"]>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
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
    canUndo,
    canRedo,
    deleteSelectedNodes,
    addNode,
    updateNodeData,
    setNodes,
    setEdges,
  };
}
