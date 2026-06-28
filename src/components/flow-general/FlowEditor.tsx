// src/components/flow-general/FlowEditor.tsx
"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ConnectionLineType,
  type Connection,
  type IsValidConnection,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DynamicNode } from "./nodes/DynamicNode";
import { DynamicEdge } from "./edges/DynamicEdge";
import { NodeTypeProvider } from "./components/NodeTypeManager";
import { ConnectionTypeProvider } from "./components/ConnectionTypeManager";
import { useConnectionTypes } from "./components/ConnectionTypeManager";

import type { FlowEditorProps, FlowNode, FlowEdge } from "./types";
import { useFlowEditor } from "./hooks/useFlowEditor";

/**
 * Internal flow canvas component with access to ReactFlow context
 */
const FlowCanvas: React.FC<{
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  className?: string;
  showBackground?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
  connectionLineType?: ConnectionLineType;
  fitView?: boolean;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
}> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  className = "",
  showBackground = true,
  showControls = true,
  showMiniMap = false,
  connectionLineType = ConnectionLineType.Bezier,
  fitView = true,
  snapToGrid = false,
  snapGrid = [15, 15],
}) => {
  const { validateConnection } = useConnectionTypes();

  /**
   * Define node types - all nodes use DynamicNode component
   */
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      default: DynamicNode,
    }),
    [],
  );

  /**
   * Define edge types - all edges use DynamicEdge component
   */
  const edgeTypes = useMemo<EdgeTypes>(
    () => ({
      default: DynamicEdge,
    }),
    [],
  );

  /**
   * Validate connection based on registered connection type rules.
   * In @xyflow/react v12 the callback receives FlowEdge | Connection
   * (called for both new connections and reconnect attempts).
   */
  const isValidConnection: IsValidConnection<FlowEdge> = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return false;

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      return validateConnection(
        sourceNode.type || "default",
        targetNode.type || "default",
      );
    },
    [nodes, validateConnection],
  );

  /**
   * Handle connection creation — only proceeds when isValidConnection passes.
   */
  const handleConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        onConnect(params);
      }
    },
    [isValidConnection, onConnect],
  );

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={connectionLineType}
        isValidConnection={isValidConnection}
        fitView={fitView}
        snapToGrid={snapToGrid}
        snapGrid={snapGrid}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
      >
        {showBackground && (
          <Background color="#e2e8f0" gap={snapGrid[0]} size={1} />
        )}
        {showControls && <Controls />}
        {showMiniMap && <MiniMap nodeStrokeWidth={3} zoomable pannable />}
      </ReactFlow>
    </div>
  );
};

/**
 * Main Flow Editor Component (General Purpose)
 */
export const FlowEditor: React.FC<FlowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  nodeTypeConfigs = [],
  connectionTypeConfigs = [],
  onSave,
  onLoad,
  autoSave = false,
  autoSaveInterval = 30000,
  storageKey = "flow-editor-state",
  className = "",
  showBackground = true,
  showControls = true,
  showMiniMap = false,
  connectionLineType = ConnectionLineType.Bezier,
  fitView = true,
  snapToGrid = false,
  snapGrid = [15, 15],
  children,
}) => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useFlowEditor({
      initialNodes,
      initialEdges,
      onSave,
      onLoad,
      autoSave,
      autoSaveInterval,
      storageKey,
    });

  return (
    <NodeTypeProvider initialTypes={nodeTypeConfigs}>
      <ConnectionTypeProvider initialTypes={connectionTypeConfigs}>
        <ReactFlowProvider>
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            className={className}
            showBackground={showBackground}
            showControls={showControls}
            showMiniMap={showMiniMap}
            connectionLineType={connectionLineType}
            fitView={fitView}
            snapToGrid={snapToGrid}
            snapGrid={snapGrid}
          />
          {children}
        </ReactFlowProvider>
      </ConnectionTypeProvider>
    </NodeTypeProvider>
  );
};

export default FlowEditor;
