import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { CategoryNodeData } from "@/types/nodes";

interface CategoryNodeProps {
  data: CategoryNodeData;
  selected?: boolean;
}

const CategoryNode = memo(({ data, selected }: CategoryNodeProps) => {
  return (
    <div className="relative">
      {/* Rectangle shape with built-in blue styling */}
      <div
        className="relative flex items-center justify-center rounded-lg px-6 py-4 min-w-35 transition-all duration-200 bg-blue-600 hover:bg-blue-700"
        style={{
          boxShadow: selected
            ? "0 0 0 3px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(0,0,0,0.15)"
            : "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Inner border effect */}
        <div className="absolute inset-0 rounded-lg opacity-20 pointer-events-none border-2 border-white/50" />

        {/* Label text */}
        <div className="relative z-10 text-center text-white font-bold text-sm leading-tight drop-shadow-sm">
          {data.label}
        </div>
      </div>

      {/* Target handles from parent hub - 4 directions */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      {/* Source handles for children standards - multiple directions */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />
    </div>
  );
});

CategoryNode.displayName = "CategoryNode";

export default CategoryNode;
