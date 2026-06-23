// src/components/reacr-flow/nodes/PositionLoggerNode.tsx

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

export type PositionLoggerNodeData = {
  label?: string;
};

export type PositionLoggerNode = Node<PositionLoggerNodeData>;

export default function PositionLoggerNode({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
}: NodeProps<PositionLoggerNode>) {
  const x = `${Math.round(positionAbsoluteX)}px`;
  const y = `${Math.round(positionAbsoluteY)}px`;

  return (
    <div className="react-flow__node-default">
      {/* Input handle for incoming connections */}
      <Handle type="target" position={Position.Top} />

      {data.label && <div className="font-semibold">{data.label}</div>}

      <div className="text-xs text-gray-600">
        {x} {y}
      </div>

      {/* Output handle for outgoing connections */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
