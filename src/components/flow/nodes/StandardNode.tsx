// src/components/flow/nodes/StandardNode.tsx
import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { StandardNodeData } from "@/types/nodes";
import { getStandardColor, getStandardHoverColor } from "@/types/nodes";
import { HANDLE1 } from "./handle-style";

interface StandardNodeProps {
  data: StandardNodeData;
  selected?: boolean;
}

const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const StandardNode = memo(({ data, selected }: StandardNodeProps) => {
  const stdType = data.standardType ?? "OTHER";
  const isApi = stdType === "API";
  const bg = getStandardColor(stdType);
  const bgHover = getStandardHoverColor(stdType);
  const shadow = selected
    ? `0 0 0 3px ${bg}66, 0 4px 12px rgba(0,0,0,0.15)`
    : "0 2px 8px rgba(0,0,0,0.1)";

  const handles = (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={`${HANDLE1}`}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
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
        position={Position.Right}
        id="right"
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
        position={Position.Left}
        id="left"
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
        id="right"
        className={`${HANDLE1}`}
      />
    </>
  );

  return (
    <div className="relative group">
      {isApi ? (
        // ── API: circle ────────────────────────────────────────────────────
        <div
          className="relative flex items-center justify-center rounded-full w-18 h-18 transition-colors duration-200 cursor-default"
          style={{
            backgroundColor: bg,
            boxShadow: shadow,
          }}
          // CSS-only hover — avoids inline event handlers
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = bgHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = bg;
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none border-2 border-white/50" />
          <div className="relative z-10 text-center text-white font-semibold text-xs leading-tight drop-shadow-sm px-2">
            {data.label}
          </div>
        </div>
      ) : (
        // ── Non-API: hexagon ───────────────────────────────────────────────
        <div
          className="relative flex items-center justify-center w-18 h-18 transition-colors duration-200 cursor-default"
          style={{
            clipPath: HEX_CLIP,
            backgroundColor: bg,
            boxShadow: shadow,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = bgHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = bg;
          }}
        >
          <div
            className="absolute inset-1 opacity-20 pointer-events-none border-2 border-white/50"
            style={{ clipPath: HEX_CLIP }}
          />
          <div className="relative z-10 text-center text-white font-semibold text-[11px] leading-tight drop-shadow-sm px-3">
            {/* Show stdType tag + label */}
            <span className="block text-white/70 text-[9px] font-normal mb-0.5">
              {stdType}
            </span>
            {data.label}
          </div>
        </div>
      )}

      {handles}
    </div>
  );
});

StandardNode.displayName = "StandardNode";
export default StandardNode;
