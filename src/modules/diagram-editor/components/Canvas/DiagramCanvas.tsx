import React, { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useDiagramStore } from "@/modules/diagram-editor/store/diagramStore";
import { nodeTypes } from "@/modules/diagram-editor/components/Nodes/CustomNodeTypes";
import { edgeTypes } from "@/modules/diagram-editor/components/Edges/CustomEdgeTypes";
import { nanoid } from "nanoid";

export const DiagramCanvas: React.FC = () => {
  const { nodes, edges, setNodes, setEdges, addNode } = useDiagramStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 1. Corrected Handler Types using @xyflow/react
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      // Adding markerEnd for proper arrow visualization
      const newEdge: Edge = {
        ...params,
        id: nanoid(),
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  // 2. Corrected Drag and Drop handlers
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Ensure addNode receives both type and position
      addNode(type, position);
    },
    [addNode],
  );

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
