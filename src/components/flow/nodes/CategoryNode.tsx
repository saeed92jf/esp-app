import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { CategoryNodeData } from "@/types/nodes";
import { HANDLE1 } from "./handle-style";

interface CategoryNodeProps {
  data: CategoryNodeData;
  selected?: boolean;
}

const CategoryNode = memo(({ data, selected }: CategoryNodeProps) => {
  return (
    <div className="relative">
      {/* Rectangle shape with built-in blue styling */}
      <div className="relative flex items-center justify-center rounded-lg px-6 py-4 min-w-35 transition-all duration-200 bg-muted hover:bg-muted-foreground">
        {/* Inner border effect */}
        <div className="absolute inset-0 rounded-lg opacity-20 pointer-events-none border-2 border-foreground" />

        {/* Label text */}
        <div className="relative z-10 text-center text-foreground font-bold text-sm leading-tight drop-shadow-sm">
          {data.label}
        </div>
      </div>

      {/* Target handles from parent hub - 4 directions */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={`${HANDLE1}`}
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className={`${HANDLE1}`}
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className={`${HANDLE1}`}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={`${HANDLE1}`}
      />

      {/* Source handles for children standards - multiple directions */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className={`${HANDLE1}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className={`${HANDLE1}`}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className={`${HANDLE1}`}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        className={`${HANDLE1}`}
      />
    </div>
  );
});

CategoryNode.displayName = "CategoryNode";

export default CategoryNode;
