import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { HubNodeData } from "@/types/nodes";
import { HANDLE1 } from "./handle-style";

interface HubNodeProps {
  data: HubNodeData;
  selected?: boolean;
}

const OUTER_CLIP =
  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";
const INNER_CLIP =
  "polygon(30.3% 1%, 69.8% 1%, 99% 30.3%, 99% 69.8%, 69.8% 99%, 30.3% 99%, 1% 69.8%, 1% 30.3%)";

const HubNode = memo(({ data, selected }: HubNodeProps) => {
  return (
    <div className="relative">
      <div
        className="relative flex items-center justify-center transition-all duration-200"
        style={{
          width: "200px",
          height: "200px",
          clipPath: OUTER_CLIP,
          backgroundColor: "var(--shape-ring)",
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          clipPath: INNER_CLIP,
          backgroundColor: "var(--color-muted)", // یا bg-muted
        }}
      >
        {/* Label text */}
        <div className="relative z-10 text-center text-foreground font-bold text-lg px-3 ">
          {data.label}
        </div>
      </div>

      {/* Handles - 8 directions for octagon */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className={`${HANDLE1}`}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="top-right"
        className={`${HANDLE1}`}
        style={{ top: "15%", right: "15%" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`${HANDLE1}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={`${HANDLE1}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="bottom-right"
        className={`${HANDLE1}`}
        style={{ top: "85%", right: "15%" }}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="bottom-right"
        className={`${HANDLE1}`}
        style={{ top: "85%", left: "15%" }}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className={`${HANDLE1}`}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="top-left"
        className={`${HANDLE1}`}
        style={{ top: "15%", left: "15%" }}
      />
    </div>
  );
});

HubNode.displayName = "HubNode";

export default HubNode;
