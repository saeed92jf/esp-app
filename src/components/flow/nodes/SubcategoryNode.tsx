import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { SubcategoryNodeData } from "@/types/nodes";

interface SubcategoryNodeProps {
  data: SubcategoryNodeData;
  selected?: boolean;
}

const SubcategoryNode = memo(({ data, selected }: SubcategoryNodeProps) => {
  return (
    <div className="relative">
      {/* Rounded rectangle with built-in purple styling */}
      <div
        className="relative flex items-center justify-center rounded-md px-5 py-3 min-w-30 transition-all duration-200 bg-purple-600 hover:bg-purple-700"
        style={{
          boxShadow: selected
            ? "0 0 0 3px rgba(147, 51, 234, 0.4), 0 4px 12px rgba(0,0,0,0.15)"
            : "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Inner border effect */}
        <div className="absolute inset-0 rounded-md opacity-20 pointer-events-none border-2 border-white/50" />

        {/* Label text */}
        <div className="relative z-10 text-center text-white font-semibold text-sm leading-tight drop-shadow-sm">
          {data.label}
        </div>
      </div>

      {/* Target handles from parent category - multiple directions */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
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

SubcategoryNode.displayName = "SubcategoryNode";

export default SubcategoryNode;
