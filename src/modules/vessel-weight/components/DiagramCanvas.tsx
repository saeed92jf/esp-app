'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useVesselWeightStore } from '../store/useVesselWeightStore';
import { VesselRootNode } from './nodes/VesselRootNode';
import { ShellNode } from './nodes/ShellNode';
import { HeadNode } from './nodes/HeadNode';
import { NozzleNode } from './nodes/NozzleNode';
import { SupportNode } from './nodes/SupportNode';
import { AttachmentsNode } from './nodes/AttachmentsNode';
import { InternalsNode } from './nodes/InternalsNode';
import { MistEliminatorNode } from './nodes/MistEliminatorNode';
import { OutputHubNode } from './nodes/OutputHubNode';

const nodeTypes = {
  vesselRootNode: VesselRootNode,
  shellNode: ShellNode,
  headNode: HeadNode,
  nozzleNode: NozzleNode,
  supportNode: SupportNode,
  attachmentsNode: AttachmentsNode,
  internalsNode: InternalsNode,
  mistEliminatorNode: MistEliminatorNode,
  outputHubNode: OutputHubNode,
};

let idCounter = 1;
const getId = () => `vw_node_${idCounter++}`;

export function DiagramCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useVesselWeightStore((s) => s.nodes);
  const edges = useVesselWeightStore((s) => s.edges);
  const onNodesChange = useVesselWeightStore((s) => s.onNodesChange);
  const onEdgesChange = useVesselWeightStore((s) => s.onEdgesChange);
  const onConnect = useVesselWeightStore((s) => s.onConnect);
  const setSelectedNodeId = useVesselWeightStore((s) => s.setSelectedNodeId);

  // Keyboard deletion is naturally handled by ReactFlow when elements are selected 
  // and user presses Backspace/Delete. We just need to make sure onNodesChange handles 'remove'.

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      onNodesChange([{ type: 'add', item: newNode }]);
    },
    [screenToFlowPosition, onNodesChange]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={(params) => {
          setSelectedNodeId(params.nodes.length === 1 ? params.nodes[0].id : null);
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-muted/10"
      >
        <Background gap={16} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  );
}
