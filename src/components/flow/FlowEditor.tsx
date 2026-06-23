// src/components/flow/FlowEditor.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type EdgeMouseHandler,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Node + edge registries
import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";

// Panels
import DiagramLegend from "./DiagramLegend";
import { EdgeOptionsPanel } from "./edges/EdgeOptionsPanel";
import { UnifiedToolbar } from "./Toolbar";
import { NodeEditPanel } from "./NodeEditPanel";

// State management
import { useFlowState } from "./useFlowState";

// Initial diagram data (built from equipmentDiagramData + positions)
import { initialNodes, initialEdges } from "@/data/equipmentDiagramBuilder";

// ─── MiniMap colour helper ────────────────────────────────────────────────────
const MINIMAP_COLORS: Record<string, string> = {
  hub: "#d97706",
  category: "#2563eb",
  subcategory: "#7c3aed",
  standard: "#22c55e",
};
const minimapNodeColor = (node: Node) =>
  MINIMAP_COLORS[node.type ?? ""] ?? "#6b7280";

// ─── Inner component (has access to ReactFlow context) ───────────────────────
function FlowEditorContent() {
  const {
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
  } = useFlowState(initialNodes, initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isEdgePanelOpen, setIsEdgePanelOpen] = useState(false);

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setSelectedEdgeId(edge.id);
      setIsEdgePanelOpen(true);
      setSelectedNodeId(null);
    },
    [setSelectedEdgeId],
  );

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    setSelectedNodeId(null);
    setIsEdgePanelOpen(false);
  }, [setSelectedEdgeId]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      setIsEdgePanelOpen(false);
    },
    [setSelectedEdgeId],
  );

  // Delete selected via keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        e.preventDefault();
        deleteSelectedNodes();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelectedNodes]);

  const handleImport = useCallback(
    (importedNodes: Node[], importedEdges: Edge[]) => {
      setNodes(importedNodes);
      setEdges(importedEdges);
    },
    [setNodes, setEdges],
  );

  const selectedNode = selectedNodeId
    ? (nodes.find((n) => n.id === selectedNodeId) ?? null)
    : null;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] w-full flex-col">
      <UnifiedToolbar
        onAddNode={addNode}
        nodes={nodes}
        edges={edges}
        onImport={handleImport}
        onReset={resetState}
        onSave={saveState}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Canvas */}
      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-muted/30"
        >
          <Background color="#94a3b8" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={minimapNodeColor}
            className="bg-card! border-border!"
          />
        </ReactFlow>

        {/* Overlays */}
        <DiagramLegend />

        {selectedEdgeId && (
          <EdgeOptionsPanel
            edgeId={selectedEdgeId}
            open={isEdgePanelOpen}
            onOpenChange={setIsEdgePanelOpen}
          />
        )}

        <NodeEditPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={updateNodeData}
        />
      </div>
    </div>
  );
}

// ─── Public export (wraps provider) ─────────────────────────────────────────
export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorContent />
    </ReactFlowProvider>
  );
}
