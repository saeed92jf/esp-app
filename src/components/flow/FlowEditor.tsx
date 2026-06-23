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

// Custom nodes
import HubNode from "./nodes/HubNode";
import CategoryNode from "./nodes/CategoryNode";
import StandardNode from "./nodes/StandardNode";
import SubcategoryNode from "./nodes/SubcategoryNode";
import ButtonEdge from "./edges/ButtonEdge";
import { EdgeOptionsPanel } from "./edges/EdgeOptionsPanel";
import { UnifiedToolbar } from "./Toolbar";
import { NodeEditPanel } from "./NodeEditPanel";

// State management
import { useFlowState } from "./useFlowState";

// Initial data
import { initialNodes, initialEdges } from "@/data/equipmentDiagramBuilder";

const nodeTypes = {
  hub: HubNode,
  category: CategoryNode,
  standard: StandardNode,
  subcategory: SubcategoryNode,
};

const edgeTypes = {
  buttonedge: ButtonEdge,
};

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          deleteSelectedNodes();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedNodes]);

  const handleImport = useCallback(
    (importedNodes: Node[], importedEdges: typeof edges) => {
      setNodes(importedNodes);
      setEdges(importedEdges);
    },
    [setNodes, setEdges],
  );

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] w-full flex-col">
      {/* Unified Toolbar */}
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

      {/* Flow canvas */}
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
          className="bg-surface-secondary"
        >
          <Background color="#94a3b8" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case "hub":
                  return "#f59e0b";
                case "category":
                  return "#3b82f6";
                case "standard":
                  return "#10b981";
                case "subcategory":
                  return "#8b5cf6";
                default:
                  return "#6b7280";
              }
            }}
            className="bg-surface-primary! border-warm-border!"
          />
        </ReactFlow>

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

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorContent />
    </ReactFlowProvider>
  );
}
