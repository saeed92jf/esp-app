import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { HubNodeData } from "@/types/nodes";

interface HubNodeProps {
  data: HubNodeData;
  selected?: boolean;
}

const HubNode = memo(({ data, selected }: HubNodeProps) => {
  return (
    <div className="relative">
      {/* Octagon shape with built-in styling */}
      <div
        className="relative flex items-center justify-center transition-all duration-200 bg-amber-600 hover:bg-amber-700"
        style={{
          width: "120px",
          height: "120px",
          clipPath:
            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
          boxShadow: selected
            ? "0 0 0 3px rgba(200, 133, 63, 0.4), 0 4px 12px rgba(0,0,0,0.15)"
            : "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Inner border effect */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            border: "2px solid rgba(255,255,255,0.5)",
          }}
        />

        {/* Label text */}
        <div className="relative z-10 text-center text-white font-bold text-sm px-3 leading-tight drop-shadow-sm">
          {data.label}
        </div>
      </div>

      {/* Handles - 8 directions for octagon */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="top-right"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
        style={{ top: "15%", right: "15%" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="bottom-right"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
        style={{ bottom: "15%", right: "15%" }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="source"
        position={Position.Left}
        id="bottom-left"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
        style={{ bottom: "15%", left: "15%" }}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />

      <Handle
        type="source"
        position={Position.Left}
        id="top-left"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
        style={{ top: "15%", left: "15%" }}
      />
    </div>
  );
});

HubNode.displayName = "HubNode";

export default HubNode;
