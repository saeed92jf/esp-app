import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { StandardNodeData } from "@/types/nodes";

interface StandardNodeProps {
  data: StandardNodeData;
  selected?: boolean;
}

const StandardNode = memo(({ data, selected }: StandardNodeProps) => {
  // Determine if this is an API standard or non-API standard
  const isApiStandard = data.standardType === "API";

  return (
    <div className="relative">
      {isApiStandard ? (
        // API Standard: Circle with green color
        <div
          className="relative flex items-center justify-center rounded-full w-24 h-24 transition-all duration-200 bg-green-600 hover:bg-green-700"
          style={{
            boxShadow: selected
              ? "0 0 0 3px rgba(34, 197, 94, 0.4), 0 4px 12px rgba(0,0,0,0.15)"
              : "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* Inner border effect */}
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none border-2 border-white/50" />

          {/* Label text */}
          <div className="relative z-10 text-center text-white font-semibold text-xs leading-tight drop-shadow-sm px-2">
            {data.label}
          </div>
        </div>
      ) : (
        // Non-API Standard (ASME, ASTM, NACE, NBIC, OTHER): Hexagon with gray color
        <div
          className="relative flex items-center justify-center w-28 h-28 transition-all duration-200"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            backgroundColor: "#6B7280", // gray-500
            boxShadow: selected
              ? "0 0 0 3px rgba(107, 114, 128, 0.4), 0 4px 12px rgba(0,0,0,0.15)"
              : "0 2px 8px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4B5563"; // gray-600 on hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6B7280"; // gray-500
          }}
        >
          {/* Inner border effect for hexagon */}
          <div
            className="absolute inset-1 opacity-20 pointer-events-none border-2 border-white/50"
            style={{
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />

          {/* Label text */}
          <div className="relative z-10 text-center text-white font-semibold text-xs leading-tight drop-shadow-sm px-3">
            {data.label}
          </div>
        </div>
      )}

      {/* Target handles from parent subcategory - multiple directions */}
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

      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="w-3! h-3! bg-white! border-2! border-gray-400!"
      />
    </div>
  );
});

StandardNode.displayName = "StandardNode";

export default StandardNode;
