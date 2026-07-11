"use client";

import React, { useCallback, useRef } from "react";
import { RotateCw } from "lucide-react";

/**
 * https://reactflow.dev/examples/nodes/rotatable-node
 *
 * Drag this to rotate the node. `nodeRef` must point at the node's outer
 * (UNROTATED) wrapper element â€” its bounding box center is the pivot the
 * angle is measured from, and stays correct regardless of the current
 * rotation (rotating a box around its own center doesn't move that center).
 *
 * Deliberately rendered as a CHILD of the same element that gets
 * `transform: rotate(...)` applied (not a sibling positioned independently)
 * â€” that's what makes the handle move/rotate along with the node instead of
 * staying pinned at a fixed spot on screen.
 */
export function RotateHandle({
  nodeRef,
  rotation,
  onRotate,
  onRotateEnd,
}: {
  nodeRef: React.RefObject<HTMLElement | null>;
  rotation: number;
  onRotate: (deg: number) => void;
  onRotateEnd?: () => void;
}) {
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      dragging.current = true;

      const onMove = (moveEvent: MouseEvent) => {
        if (!dragging.current || !nodeRef.current) return;
        const rect = nodeRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        // atan2 measures from the +x axis; +90 so 0Â° corresponds to "handle straight up".
        const angle = (Math.atan2(moveEvent.clientY - cy, moveEvent.clientX - cx) * 180) / Math.PI + 90;
        const normalized = ((angle % 360) + 360) % 360;
        onRotate(normalized);
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        onRotateEnd?.();
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [nodeRef, onRotate, onRotateEnd],
  );

  return (
    <div
      // nodrag/nopan keep this from starting a node-drag or canvas-pan
      className="nodrag nopan absolute start-1/2 -top-7 z-10 flex size-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-indigo-500 bg-white shadow-sm active:cursor-grabbing dark:bg-slate-800"
      onMouseDown={onMouseDown}
      title={`Rotate (${Math.round(rotation)}Â°)`}
    >
      <RotateCw className="size-3 text-indigo-500" />
    </div>
  );
}


